# SEO Strategy

## Meta Tags (index.html)

| Tag | Content |
|---|---|
| `<title>` | Akash Nagapure \| Microsoft Intune, SCCM & VMware Architect |
| `<meta name="description">` | Portfolio of Akash Nagapure - Enterprise Fleet Architect specializing in Microsoft Intune, SCCM, and VMware virtualization. |
| `<meta name="title">` | Akash Nagapure \| Microsoft Intune, SCCM & VMware Architect |
| `<link rel="canonical">` | https://www.akashnagapure.in/ |
| `<link rel="icon">` | `/Main_page_data/Logo.avif` (AVIF format) |

## Open Graph (og:)

| Property | Value |
|---|---|
| `og:type` | website |
| `og:url` | https://www.akashnagapure.in/ |
| `og:title` | Akash Nagapure \| Microsoft Intune, SCCM & VMware Architect |
| `og:description` | Enterprise endpoint security specialist, virtualization engineer, and cloud systems architect. |
| `og:image` | https://www.akashnagapure.in/Main_page_data/akash_profile_1781110763642.avif |

## Twitter Card

| Property | Value |
|---|---|
| `twitter:card` | summary_large_image |
| `twitter:url` | https://www.akashnagapure.in/ |
| `twitter:title` | Akash Nagapure \| Microsoft Intune, SCCM & VMware Architect |
| `twitter:description` | Enterprise endpoint security specialist, virtualization engineer, and cloud systems architect. |
| `twitter:image` | https://www.akashnagapure.in/Main_page_data/akash_profile_1781110763642.avif |

## Structured Data (JSON-LD)

The landing page includes a `ProfilePage` schema with a nested `Person` entity:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": "Akash Nagapure",
    "jobTitle": "Microsoft Intune & VMware Architect",
    "description": "Enterprise endpoint security specialist and systems engineer managing 35,000+ endpoints.",
    "url": "https://www.akashnagapure.in/",
    "sameAs": ["https://www.linkedin.com/in/anagapure"],
    "worksFor": {
      "@type": "Organization",
      "name": "Hexaware Technologies"
    }
  }
}
```

## Sitemap

- **File**: `/sitemap.xml`
- **Format**: XML (Google Sitemap Protocol)
- **Contents**: All top-level pages and key sub-pages (20 entries)
- **Priority strategy**: Homepage = 1.0, primary pages = 0.8, sub-pages = 0.6–0.7

## robots.txt

```
User-agent: *
Allow: /
Sitemap: https://www.akashnagapure.in/sitemap.xml
```

## Subdomain SEO

Each sub-domain (`blogs.`, `coins.`, `gaming.`, etc.) serves a different sub-page via
Vercel middleware. All sub-pages should include their own canonical URL pointing
to the sub-domain to avoid duplicate content.

## Keywords

**Primary keywords:**
- Microsoft Intune architect
- SCCM administrator
- VMware virtualization
- Enterprise endpoint security
- Cloud-native automation
- PowerShell scripting
- Azure Virtual Desktop
- Windows 365
- Device management 35,000 endpoints

**Secondary keywords:**
- Intune compliance policies
- SCCM content distribution
- Autopilot troubleshooting
- Win32 app packaging
- Graph API PowerShell
- Zero-trust security
- Homelab setup
- Numismatics coin collection

## Performance SEO

- AVIF images (next-gen format with WebP fallback)
- `loading="lazy"` on offscreen images
- `fetchpriority="high"` on hero image
- Preconnect to Google Fonts
- Minified CSS/JS via Vite build
- Gzip compression via Vercel

## Monitoring

- Manual checks performed via `routes-check.txt` and `header-check.txt`
- Header verification confirms `Cache-Control: no-cache` is applied
- ETag and Last-Modified headers present on static assets
