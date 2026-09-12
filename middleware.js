export default function middleware(request) {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';

  // Skip static asset files, images, and API routes
  if (
    url.pathname.startsWith('/public') ||
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/api')
  ) {
    return;
  }

  // Define subdomain routes
  const subdomainRoutes = {
    'blogs.akashnagapure.in': '/Sub_Pages/Projects.html',
    'reading.akashnagapure.in': '/Sub_Pages/Reading.html',
    'coins.akashnagapure.in': '/Sub_Pages/Coins.html',
    'homelab.akashnagapure.in': '/Sub_Pages/HomeLab.html',
    'resume.akashnagapure.in': '/Sub_Pages/resume.html',
    'skills.akashnagapure.in': '/Sub_Pages/Skills.html',
    'courses.akashnagapure.in': '/Sub_Pages/courses.html',
    'gaming.akashnagapure.in': '/Sub_Pages/Game.html',
    'food.akashnagapure.in': '/Sub_Pages/Food.html',
    'puzzle.akashnagapure.in': '/Sub_Pages/Puzzle.html'
  };

  // Check if this is a subdomain request
  for (const [domain, targetPath] of Object.entries(subdomainRoutes)) {
    if (hostname.includes(domain)) {
      // Only rewrite root path visits on subdomains
      if (url.pathname === '/') {
        url.pathname = targetPath;
        return fetch(url.toString(), request);
      }
      // Redirect any non-root path to www version
      else {
        const wwwUrl = new URL(url.href);
        wwwUrl.hostname = 'www.akashnagapure.in';
        return Response.redirect(wwwUrl.toString(), 301);
      }
    }
  }
}
