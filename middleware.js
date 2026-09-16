/* middleware.js — Vercel Edge middleware: sub-domain routing + canonical URLs.
 *
 * 1. A section sub-domain's root is rewritten to its page (invisible rewrite,
 *    the typed URL stays clean):
 *      blogs.akashnagapure.in/    -> /Sub_Pages/Projects.html
 *      resume.akashnagapure.in/   -> /Sub_Pages/resume.html      (and 8 more)
 * 2. The canonical URL of a page is always reachable on the host that owns it,
 *    so the <link rel="canonical"> in the HTML never points at a redirect:
 *      blogs.akashnagapure.in/Blogs/<article>.html      served as-is
 *      blogs.akashnagapure.in/Blogs/                    served as the article index
 *      <sub>.akashnagapure.in/Sub_Pages/<own page>.html served as-is
 * 3. www 301s section paths to the sub-domain that canonically owns them:
 *      www.akashnagapure.in/Blogs/x.html            -> blogs.akashnagapure.in/Blogs/x.html
 *      www.akashnagapure.in/Sub_Pages/resume.html   -> resume.akashnagapure.in/
 * 4. Any other path on a sub-domain still 301s to the same path on www.
 *
 * Static prefixes (/assets, /images, /api, /public, /template) are never
 * touched, so assets and the runtime footer template load same-origin on every
 * host. Regression suite: tools/middleware.test.mjs (npm run test:middleware).
 */

/** Canonical host -> page path served at that host's root. */
export const SUBDOMAIN_PAGES = {
  'blogs.akashnagapure.in': '/Sub_Pages/Projects.html',
  'reading.akashnagapure.in': '/Sub_Pages/Reading.html',
  'coins.akashnagapure.in': '/Sub_Pages/Coins.html',
  'homelab.akashnagapure.in': '/Sub_Pages/HomeLab.html',
  'resume.akashnagapure.in': '/Sub_Pages/resume.html',
  'skills.akashnagapure.in': '/Sub_Pages/Skills.html',
  'courses.akashnagapure.in': '/Sub_Pages/courses.html',
  'gaming.akashnagapure.in': '/Sub_Pages/Game.html',
  'food.akashnagapure.in': '/Sub_Pages/Food.html',
  'puzzle.akashnagapure.in': '/Sub_Pages/Puzzle.html',
};

const WWW_HOST = 'www.akashnagapure.in';
const BLOGS_HOST = 'blogs.akashnagapure.in';
const BLOG_DIR = '/Blogs';
const SKIP_PREFIXES = ['/assets', '/images', '/api', '/public', '/template'];

/** Page path -> canonical host (inverse of SUBDOMAIN_PAGES). */
const PAGE_HOST = Object.fromEntries(
  Object.entries(SUBDOMAIN_PAGES).map(([host, page]) => [page, host])
);

/** The host that canonically owns a section path, or null for everything else. */
export function ownerHost(pathname) {
  if (isBlogDir(pathname)) return BLOGS_HOST;
  return PAGE_HOST[pathname] || null;
}

function isBlogDir(pathname) {
  return pathname === BLOG_DIR || pathname === BLOG_DIR + '/' || pathname.startsWith(BLOG_DIR + '/');
}

/** True for the /Blogs directory itself (which maps to the article index). */
function isBlogIndex(pathname) {
  return pathname === BLOG_DIR || pathname === BLOG_DIR + '/';
}

/** True when a sub-domain may serve this path itself instead of redirecting. */
function servedByHost(host, pathname) {
  if (SUBDOMAIN_PAGES[host] === pathname) return true; // its own page path
  return host === BLOGS_HOST && isBlogDir(pathname); // blog articles + /Blogs/
}

function hostOf(request, url) {
  return (request.headers.get('host') || url.hostname || '').split(':')[0].toLowerCase();
}

function redirectTo(url, host, pathname) {
  const target = new URL(url.href);
  target.hostname = host;
  target.pathname = pathname;
  return Response.redirect(target.toString(), 301);
}

export default function middleware(request) {
  const url = new URL(request.url);
  const host = hostOf(request, url);
  const path = url.pathname;

  // Static assets, API routes and runtime templates are never rewritten.
  if (SKIP_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) return undefined;

  // ---- section sub-domains ------------------------------------------------
  if (SUBDOMAIN_PAGES[host]) {
    if (path === '/' || (host === BLOGS_HOST && isBlogIndex(path))) {
      // 1 + 2: rewrite to the host's page without changing the URL.
      const target = new URL(url.href);
      target.pathname = SUBDOMAIN_PAGES[host];
      return fetch(target.toString(), request);
    }
    // 2: the host's own canonical paths are served here, so canonicals resolve.
    if (servedByHost(host, path)) return fetch(url.toString(), request);
    // 4: everything else belongs to www.
    return redirectTo(url, WWW_HOST, path);
  }

  // ---- www (and the apex domain): hand section paths to their owner --------
  const owner = ownerHost(path);
  if (owner && host !== owner) {
    return redirectTo(url, owner, PAGE_HOST[path] ? '/' : path);
  }
  return undefined;
}
