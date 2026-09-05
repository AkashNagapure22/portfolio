export default function middleware(request) {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';

  // Skip static asset files, images, and API routes
  if (
    url.pathname.startsWith('/public') ||
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return;
  }

  // Only rewrite root path visits on subdomains
  if (url.pathname === '/') {
    const routes = {
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

    for (const [domain, targetPath] of Object.entries(routes)) {
      if (hostname.includes(domain)) {
        url.pathname = targetPath;
        return fetch(url.toString(), request);
      }
    }
  }
}
