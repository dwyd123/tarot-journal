# Tarot Journal

A tarot reading case management application for recording, reviewing, and organizing tarot consultations.

## Project Status

This project is currently in the early planning and development stage.

## Planned Features

- Create and edit tarot reading cases
- Record spreads, card positions, and interpretations
- Add follow-up feedback and review notes
- Search and filter historical cases
- Manage personal tarot card meanings
- View case and card statistics

## Technology

This project uses React, TypeScript, and Vite.

## Local Development

1. Install dependencies with `npm install`.
2. Start the local development server with `npm run dev`.
3. Open the local address shown in the terminal.

## Current Development Scope

The current local-first stage supports:

- fixed built-in spread selection and independent card results for each
  position;
- the complete 78-card Rider–Waite library with upright and reversed images;
- formal case entry with an automatically generated title and a full spread
  snapshot;
- browser-local case storage;
- a reusable personal card-meaning editor linked by stable `cardId`.

Run `npm run check:data` to verify the card, image, and spread data.

Case lists, cloud sync, login, custom spreads, AI interpretation, and
multi-deck switching remain out of scope.
