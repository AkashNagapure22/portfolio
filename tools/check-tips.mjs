import { readFileSync, writeFileSync } from 'node:fs';
const FILE = 'index.html';
let t = readFileSync(FILE, 'utf8');
const OLD = '<div class="w-full overflow-hidden py-3 relative">';
const NEW = '<div class="w-full overflow-hidden pt-12 pb-3 relative">';
/* also upgrade any pt-12 done by a previous run to pt-16 (tooltip needs ~3.7rem) */
const OLD12 = '<div class="w-full overflow-hidden pt-12 pb-3 relative">';
const NEW16 = '<div class="w-full overflow-hidden pt-16 pb-3 relative">';
const b1 = t.split(OLD).length - 1;
t = t.split(OLD).join(NEW);
const b2 = t.split(OLD12).length - 1;
t = t.split(OLD12).join(NEW16);
writeFileSync(FILE, t);
console.log('replaced py-3=' + b1 + ' upgraded pt-12=' + b2);
