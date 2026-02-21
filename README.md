# Foundry (鋳物工場)
> My personal portfolio website.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Python](https://img.shields.io/badge/python-3.14.2-blue.svg)

## Table of Contents
1. [About](#about)
2. [Structure](#structure)
3. [Features](#features)
4. [Blog Pipeline](#blog-pipeline)
5. [Gallery & Projects](#gallery--projects)
6. [Proxy](#proxy)
7. [Notes](#notes)
8. [Roadmap](#roadmap)
9. [References](#references)

## About
Foundry is my personal portfolio website - a hub for my open-source projects, photography, and writing. It's intentionally hand-built with no frameworks or third-pary libraries: just HTML, CSS, and vanilla JavaScript. Everything dynamic (projects, gallery, blog) is pulled live from GitHub at runtime.

## Structure
```
foundry/
├── index.html                  # Home page
├── about.html                  # About page
├── contact.html                # Contact form (Formspree)
├── projects/
│   └── index.html              # Projects page
├── gallery/
│   └── index.html              # Photo gallery with lightbox
├── blog/
│   ├── index.html              # Blog post listing
│   ├── post.html               # Individual post reader
│   ├── build_posts.py          # Markdown → HTML build script (uses Anvil)
│   └── posts/
│       ├── index.json          # Post metadata manifest
│       ├── hello-world.md      # Source post (Markdown)
│       └── hello-world.html    # Compiled post (HTML)
└── assets/
    ├── css/
    │   ├── style.css           # Global styles
    │   ├── home.css
    │   ├── blog.css
    │   ├── gallery.css
    │   ├── projects.css
    │   ├── about.css
    │   ├── contact.css
    │   └── loading.css         # Shared skeleton/shimmer animations
    ├── js/
    │   ├── main.js             # Home page featured project
    │   ├── projects.js         # Repo + commit fetching
    │   ├── gallery.js          # Image fetching + lightbox
    │   ├── blog.js             # Post listing + reader
    │   ├── contact.js          # Form submission (Formspree)
    │   └── nav.js              # Active nav link highlighting
    └── images/
        └── image_compressor.py # Batch image optimiser (Pillow)
```

## Features
- **Projects page** - fetches all public GitHub repos, displays the latest commits per repo, and shows language breakdowns with byte counts and estimated LOC.
- **Gallery** - pulls images directly from `assets/images/` in the repo via GitHub contents API. Full lightbox with keyboard and swipe navigation, metadata panel, and commit date lookup per image.
- **Blog** - reads post metadata from `blog/posts/index.json` and renders compiled HTML posts. Supports tags, excerpts, and a full post reader view.
- **Contact form** - backed by Formspree with loading/success/error states.
- **Image compressor** - `assets/images/image_compressor.py` batch-compresses images in-place using Pillow (JPEG quality 82, max 1920x1920, PNG compress level 9)

## Blog Pipeline
Blog posts are written in Markdown and compiled to HTML using [Anvil](https://github.com/Jdrc6000/Anvil) - my own Markdown compiler.

```bash
python build_posts.py
```

This runs each `.md` file in `blog/posts/` through Anvil's lexer → parser → HTML generator pipeline and writes the corresponding `.html` file alongside it.

The post listing is driven by `blog/posts/index.json`, which must be updated manually when adding a new post:

```json
[
  {
    "slug": "my-post",
    "title": "My Post Title",
    "date": "2026-02-20",
    "tags": ["general"],
    "excerpt": "A short summary shown on the listing page."
  }
]
```

## Gallery & Projects
Both pages fetch data from GitHub via a Cloudflare Worker proxy to avoid rate-limiting issues with unauthenticated GitHub API calls from the browser.

The gallery reads images from the `assets/images/` folder in the repo. To add photos, drop them in that folder (optionally run `image_compressor.py`) and push.

## Proxy
Unauthenticated GitHub API requests are limited to 60/hour per IP. To work around this, all GitHub API calls are routed through a lightweight Cloudflare Worker that adds auth headers server-side. The worker proxies:

- `/users/{username}/repos`
- `/repos/{username}/{repo}/commits`
- `/repos/{username}/{repo}/contents/{path}`
- `/repos/{username}/{repo}/languages`

## Notes
- This is a self-driven personal project. Expect rough edges, things that work but aren't pretty internally, and optimisations that haven't happened yet.
- `build_posts.py` has a hardcoded path to a local Anvil install. This needs to be made portable before the build step can be run anywhere other than my machine.

> 最適化されていない乱雑なコードが多数あります。

## Roadmap
Planned improvements:
| Feature | Priority | Notes |
|---------|----------|-------|
| Blog comments | High |  |
| Dark mode | High | improves user experience |
| Portable blog build | Medium | Remove hardcoded Anvil path in `build_posts.py` |
| Image EXIF display | Low | Show camera / lens data in gallery lightbox |

## References
* [Laurence Tratt's website](https://tratt.net/laurie/)