# ⚡ SnapLink — URL Shortener with Analytics

A full-stack URL shortener with click tracking, device analytics, and a 7-day trend chart.

## Tech Stack
- Frontend: React + Vite + Recharts
- Backend: Node.js + Express
- Database: JSON file (no external DB required)
- Auth: JWT + bcrypt

## Setup Instructions

1. Extract the zip
2. Open terminal in the snaplink-local folder
3. Run: cd server && npm install
4. Run: cd ../client && npm install
5. Run: cd .. && npm run dev
6. Open http://localhost:5173

## Features
- User signup and login with JWT auth
- Shorten any long URL to a 6-character code
- Click tracking with device and browser detection
- Dashboard showing all links with click counts
- Analytics page with 7-day trend chart
- Copy short URL to clipboard
- Delete links
- Responsive dark UI

## Assumptions
- Data is stored locally in server/data/db.json
- No external database required to run locally
- Short codes are 6 characters, alphanumeric

## AI Planning Document

### Phase 1 - Requirements
Identified core features: auth, URL shortening, redirect, analytics, dashboard

### Phase 2 - Architecture
Three collections: Users, URLs, Clicks
REST API with Express
React frontend with context-based auth

### Architecture
User -> React Frontend -> Express API -> JSON Database
Short Link Click -> Express Redirect -> Click Recorded -> Original URL

## Video Demo
https://www.loom.com/share/b4abcf3d98044cc695fb36982ca1911e

This project is a part of a hackathon run by https://katomaran.com
