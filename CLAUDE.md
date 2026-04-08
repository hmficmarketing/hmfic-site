# HMFIC Site

## Overview
Marketing and portfolio site for HMFIC Marketing (Matt's agency). The front door for client acquisition.

## Tech Stack
- **Frontend:** HTML/CSS/JS (single page)
- **Backend:** Vercel serverless function (`api/submit.js`)
- **Lead Tracking:** Airtable
- **Email:** Resend (auto-reply on form submission)
- **Deployment:** Vercel

## File Structure
```
hmfic-site/
  index.html              # Main site
  style.css               # Styles
  script.js               # Interactivity + form handling
  api/submit.js           # Serverless form handler (Airtable + Resend)
  assets/                 # Images and media
  airtable-template.csv   # Airtable schema reference
  vercel.json             # Security headers + routing
  package.json            # Dependencies
```

## Key Details
- Form submissions go to Airtable for lead tracking
- Auto-reply emails sent via Resend API
- Security headers configured (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- CORS enabled on API routes

## Commands
```bash
npm install       # Install dependencies
vercel dev        # Local development
vercel --prod     # Deploy to production
```
