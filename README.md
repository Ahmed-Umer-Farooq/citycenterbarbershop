# City Center Barbershop - static site (Vercel)

A plain static site: HTML, CSS and JavaScript, no framework, no build step, no
dependencies. Vercel serves it as-is.

## Deploy

**From the dashboard:** push this folder to GitHub, then "Add New... > Project"
on vercel.com and import the repository. Leave every build setting empty -
there is no framework and no build command. Vercel serves the committed files.

**From the terminal:**

```
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

## Viewing it locally

**Double-clicking `index.html` will not work.** Every path in the pages is absolute
(`/assets/css/site.css`, `/diensten/`), so `file://` looks for them at the drive
root and finds nothing - you get an unstyled page. That is the correct shape for
Vercel; only `file://` cannot follow it.

Instead **double-click `preview.cmd`**. It serves this folder at
<http://localhost:8080/> and opens it, which is exactly how Vercel will serve it.
Leave the window open while you browse; close it to stop.

## Pages

Each page is its own HTML file, served at a clean URL:

| URL | File |
|---|---|
| `/` | `index.html` |
| `/diensten/` | `diensten/index.html` |
| `/prijzen/` | `prijzen/index.html` |
| `/team/` | `team/index.html` |
| `/galerij/` | `galerij/index.html` |
| `/contact/` | `contact/index.html` |
| `/en/` … `/en/contact/` | the same six pages in English |

`assets/css/site.css` is the one stylesheet, `assets/js/*.js` the scripts
(each page loads only the ones it needs), plus `assets/img` and
`assets/fonts`.

## vercel.json

- `trailingSlash: true` matches the links the pages actually contain, so no
  visitor is sent through a 308 redirect on the way to a page.
- `/assets/*` is cached for a year as immutable; every page references assets
  with a `?v=` build stamp, and the HTML is always revalidated, so a new
  deploy busts them.
- The HTML is `max-age=0, must-revalidate`: a redeploy is visible on reload.
- Plus `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options`.

## Do not edit this folder by hand

It is generated. The source lives in the main project (`partials/`, `data/`,
`assets/`, `build.js`); regenerate with:

```
node export-vercel.js
```

Anything edited here is overwritten on the next export.

## Note on indexing

This is a review build, so it is blocked from search engines twice over:
`robots.txt` disallows everything, and every page carries
`<meta name="robots" content="noindex">`. Before this ever becomes the public
site, delete `robots.txt` here and remove the meta tag in the main project's
`build.js`.
