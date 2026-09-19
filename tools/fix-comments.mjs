#!/usr/bin/env node
/* FIX-COMMENTS:
   1. api/comments.js now returns BOTH `date`/`created_at` (as clean ISO-8601
      UTC) and BOTH `parentId`/`parent_id`, because blog pages read
      comment.date/comment.parentId while hobby pages read
      comment.created_at/comment.parent_id. Before, hobby pages always saw
      undefined -> "Just now"/"Invalid Date" and replies never nested.
   2. Every page with loadComments(): robust date formatting (handles ISO,
      "YYYY-MM-DD HH:MM:SS", epoch numbers), author fallback to "Anonymous",
      and a stuck-"Loading discussion threads..." retry after 3s. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

let changed = 0;

/* ---------- 1. API: emit ISO date + both alias shapes ---------- */
{
  const p = 'api/comments.js';
  let api = readFileSync(p, 'utf8');
  const DATE_SQL = `to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "date", to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "created_at"`;
  const PARENT_SQL = `parent_id as "parentId", parent_id as "parent_id"`;
  const before = api;
  api = api
    .replace(/created_at as "date"/g, DATE_SQL)
    .replace(/parent_id as "parentId"/g, PARENT_SQL);
  if (api !== before) { writeFileSync(p, api); console.log('[api] api/comments.js patched (ISO date + created_at/parent_id aliases)'); changed++; }
  else console.log('[api] already patched');
}

/* ---------- 2. Page patches ---------- */
const ROBUST_DDMMYYYY = `let dateStr = 'Recent';
    try {
      const raw = comment.date || comment.created_at;
      if (raw) {
        let d = (typeof raw === 'number') ? new Date(raw) : new Date(String(raw));
        if (isNaN(d.getTime()) && typeof raw === 'string' && !raw.includes('T')) {
          d = new Date(raw.replace(' ', 'T') + 'Z');
        }
        if (!isNaN(d.getTime())) {
          dateStr = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
        }
      }
    } catch (e) {}`;

const ROBUST_LOCALE = `let formattedDate = 'Just now';
        try {
          const raw = comment.created_at || comment.date;
          if (raw) {
            let d = (typeof raw === 'number') ? new Date(raw) : new Date(String(raw));
            if (isNaN(d.getTime()) && typeof raw === 'string' && !raw.includes('T')) {
              d = new Date(raw.replace(' ', 'T') + 'Z');
            }
            if (!isNaN(d.getTime())) {
              formattedDate = d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
            }
          }
        } catch (e) {}`;

const BOOTSTRAP = `
  /* FIX: guarantee the discussion actually loads and never sits on
     "Loading discussion threads..." — if the original DOMContentLoaded boot
     never ran (an earlier inline script threw) or the first fetch silently
     failed, retry once. */
  setTimeout(function () {
    var c = document.getElementById('comments-container');
    if (c && /Loading discussion threads/i.test(c.textContent)) {
      try { loadComments(); } catch (e) {}
    }
  }, 3000);`;

const dirs = ['public/Blogs', 'public/Sub_Pages'];
for (const dir of dirs) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.html')) continue;
    const p = join(dir, f);
    let t = readFileSync(p, 'utf8');
    if (!t.includes('async function loadComments')) continue;
    const orig = t;
    const notes = [];

    /* 2a. robust DD/MM/YYYY date block (blog family) */
    const patA = /let dateStr = 'Recent';[\s\S]*?dateStr = `\$\{day\}\/\$\{month\}\/\$\{year\}`;\s*\}\s*\}/;
    if (patA.test(t)) { t = t.replace(patA, ROBUST_DDMMYYYY); notes.push('dateA'); }

    /* 2b. robust locale date block (hobby family) */
    const patB = /const formattedDate = comment\.created_at \? new Date\(comment\.created_at\)\.toLocaleString\('en-US', \{[\s\S]*?\}\) : '[^']*';/;
    if (patB.test(t)) { t = t.replace(patB, ROBUST_LOCALE.replace(/\n/g, '\n        ')); notes.push('dateB'); }

    /* 2c. author fallback (never render "undefined"/blank name) */
    if (t.includes('escapeHTML(comment.author)')) {
      t = t.split('escapeHTML(comment.author)').join("escapeHTML(comment.author || 'Anonymous')");
      notes.push('authorFallback');
    }

    /* 2d. stuck-loading retry, appended after the loadComments definition */
    if (!t.includes('Loading discussion threads/i.test(c.textContent)')) {
      const anchor = t.indexOf('async function loadComments');
      if (anchor !== -1) {
        // find the end of the loadComments function: the closing "  }\n" that
        // precedes the next "  function renderCommentNode"
        const rcIdx = t.indexOf('function renderCommentNode', anchor);
        if (rcIdx !== -1) {
          t = t.slice(0, rcIdx) + BOOTSTRAP + '\n\n  ' + t.slice(rcIdx);
          notes.push('bootstrap');
        }
      }
    }

    if (t !== orig) { writeFileSync(p, t); changed++; console.log('[patched] ' + p + ' :: ' + notes.join(', ')); }
    else console.log('[ok]      ' + p);
  }
}
console.log('Done. ' + changed + ' file(s) updated.');
