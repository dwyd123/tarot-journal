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

The third development stage provides three reusable visual components:

- `TarotCardPicker`: category-based click selection from the existing 78 cards,
  returning the selected `cardId` to the active spread position;
- `TarotCardFace`: a text placeholder card with upright and reversed display;
- `SpreadPreview`: clickable fixed positions with independent temporary card
  and orientation selections.

Run `npm run check:data` to verify the card and spread data.

The picker returns an existing `cardId` and does not accept free-text card
names. Each position requires an explicit card selection before its upright or
reversed direction can be chosen. Case forms, persistence, real images, search,
and spread editing remain out of scope.
