# Design Log Website

A simple static website for documenting team progress and meeting notes. It includes a form for adding a new note by team member, stores the entries in the browser, and presents the log in a clean, accessible layout.

## Features

- 5-person team member dropdown
- Date field for each entry
- Notes textarea for meeting updates
- Local browser storage so entries remain available after refresh
- Minimal design that is easy for instructors to access

## Run locally

```bash
npm install
npm run dev
```

## Recommended hosting

For a simple static site like this, the best options are:

- GitHub Pages: easiest and free for a course project
- Netlify: simple drag-and-drop or Git deployment
- Cloudflare Pages: good performance and easy static hosting

If you want the simplest student-friendly option, GitHub Pages is the best recommendation.

## Build for production

```bash
npm run build
```

The generated `dist` folder can be uploaded directly to a static host.
