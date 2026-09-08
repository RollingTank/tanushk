**Personal Webpage Project**

This project is a modern, responsive personal portfolio site built with semantic HTML and custom CSS — no framework, no client-side JavaScript. The only backend piece is a small Vercel serverless function that emails contact-form submissions.

Pages: Home, About (education, skills, experience), Projects, and Contact.

Features:
- Clean, accessible design with a unified color system, gradients, and shadows
- Responsive layout for desktop, tablet, and mobile
- Sticky navigation, hero section with stat highlights, focus-area cards, an experience timeline, and skill tag groups
- Collapsible project entries (`<details>`) with tech-stack tags, links, and screenshots
- Accessible contact form plus LinkedIn/GitHub links (no contact info published in plain text)
- Smooth fade-in animation and custom scrollbar
- "Back to top" floating button

**Deploying the contact form:** this site is meant to be deployed on [Vercel](https://vercel.com), which serves the static pages and `api/contact.js` together. In the Vercel project's Environment Variables, set `GMAIL_USER` and `GMAIL_APP_PASSWORD` (a Gmail [App Password](https://myaccount.google.com/apppasswords), which requires 2-Step Verification on that account) and, optionally, `CONTACT_TO`. See [.env.example](.env.example) for local testing with `vercel dev`. A fully static host (e.g. GitHub Pages) cannot run the serverless function.
