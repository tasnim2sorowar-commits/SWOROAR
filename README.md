# My Friend Wall 🩹

A simple personal profile website that looks like a corkboard with pinned
polaroid photos of your friends. No frameworks, no build step — just
HTML, CSS, and JavaScript.

## 1. Customize it

**Your intro card** — open `index.html` and edit:
- `#my-name`, `#my-bio`, the tags (university, city, email)
- `#me-photo` — replace the "YN" text with your initials, or swap the
  whole `<div id="me-photo">` for an `<img>` tag pointing at your own photo.

**Your friends** — open `script.js` and edit the `friends` array at the
top. For each friend you can set:
- `name` — their name
- `note` — a short line that shows up when someone clicks their photo
- `color` — the background color of their placeholder circle
- `photo` — leave as `""` to use the colored initials, or put a path like
  `"images/maya.jpg"` to use a real picture

To use real photos: drop the image files into the `images/` folder, then
set `photo: "images/yourfile.jpg"` for that friend.

## 2. Try it locally

Just open `index.html` in your browser — no installation needed.

## 3. Put it on GitHub

```bash
cd profile-site
git init
git add .
git commit -m "My friend wall site"
```

Then create a new repository on GitHub (no README/license, since you
already have files), and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New… → Project**.
3. Select the repository you just pushed.
4. Framework preset: choose **"Other"** (this is a plain static site,
   no build command needed).
5. Click **Deploy**.

That's it — Vercel will give you a live URL (something like
`your-repo.vercel.app`) within a minute. Every time you push new changes
to GitHub, Vercel automatically redeploys.

## File structure

```
profile-site/
├── index.html      → page structure (your intro card)
├── style.css        → all the visual styling (corkboard, polaroids)
├── script.js        → your friends list + interactions
└── images/          → put real photos here (optional)
```
