# Project: STS Seed Database

## Overview
A website for Slay the Spire players to share and discover interesting seeds.

## Tech Stack (MVP)
- Frontend: Static HTML + vanilla JS (simple, fast)
- Backend: Python Flask or Node.js Express
- Database: SQLite (start simple) or JSON files
- Hosting: ~500 RMB/year for VPS

## MVP Features
1. Submit a seed (game version, character, seed number, brief description)
2. Browse seeds (filter by game, character, sort by date/likes)
3. View seed details
4. Upvote/likes system

## Database Schema (Simple)
```
seeds:
  - id: number
  - game_version: string  # "sts1" or "sts2"
  - seed_number: string
  - character: string     # "Ironclad", "Silent", etc.
  - title: string
  - description: text
  - tags: array          # ["rare_relic", "good_shop", etc.]
  - author: string
  - created_at: datetime
  - upvotes: number
```

## Roadmap

### Phase 1: Setup (Week 1)
- [ ] Choose tech stack
- [ ] Set up local dev environment
- [ ] Create basic project structure

### Phase 2: Core Features (Week 2-3)
- [ ] Build seed submission form
- [ ] Build seed list/browse page
- [ ] Build seed detail view
- [ ] Add basic search/filter

### Phase 3: Content (Week 4)
- [ ] Add 20-30 initial seeds (your own runs)
- [ ] Write descriptions for each
- [ ] Test everything

### Phase 4: Launch (Week 5)
- [ ] Buy domain
- [ ] Deploy to server
- [ ] Share in STS community

## Notes
- Start with manual seed entry
- Can add seed analysis later
- Focus on "good seeds" curation, not all seeds
