import { rewrite } from '@vercel/edge';

export default function middleware(request) {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';

  // Skip static asset files and API routes
  if (
    url.pathname.startsWith('/public') ||
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return;
  }

  // Only rewrite root visits on subdomains
  if (url.pathname === '/') {
    if (hostname.includes('blogs.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/Projects.html', request.url));
    }
    if (hostname.includes('reading.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/Reading.html', request.url));
    }
    if (hostname.includes('coins.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/Coins.html', request.url));
    }
    if (hostname.includes('homelab.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/HomeLab.html', request.url));
    }
    if (hostname.includes('resume.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/resume.html', request.url));
    }
    if (hostname.includes('skills.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/Skills.html', request.url));
    }
    if (hostname.includes('courses.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/courses.html', request.url));
    }
    if (hostname.includes('gaming.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/Game.html', request.url));
    }
    if (hostname.includes('food.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/Food.html', request.url));
    }
    if (hostname.includes('puzzle.akashnagapure.in')) {
      return rewrite(new URL('/Sub_Pages/Puzzle.html', request.url));
    }
  }
}