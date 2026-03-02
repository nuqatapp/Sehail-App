# Sehail (سِهيل) - Saudi Outdoor Companion App

## Overview
A Saudi outdoor companion app for hiking, camping, and desert trips. Provides knowledge and preparation, not direct rescue. Follows an offline-first, data-driven architecture.

## Tech Stack
- **Frontend**: Expo (React Native) with Expo Router (file-based routing)
- **Backend**: Express.js (minimal, serves landing page and API)
- **Styling**: React Native StyleSheet with Cairo Arabic font
- **State**: AsyncStorage for local persistence, React Query for server state
- **Data**: wisdom.json as the content brain - add new items without code changes

## Architecture
- **Data-Driven**: All content lives in `data/wisdom.json`. The UI reads categories/items and renders them dynamically. To add new content, edit the JSON file only.
- **Offline-First**: All guides, stories, checklists stored locally. No cloud database required.
- **RTL Arabic**: All text is right-to-left Arabic with Cairo font family.

## File Structure
```
app/
  _layout.tsx           - Root layout with fonts, providers
  (tabs)/
    _layout.tsx         - Tab navigation (4 tabs)
    index.tsx           - المجلس (Home dashboard)
    guide.tsx           - بصيرة البر (Field guide)
    stories.tsx         - سوالف سِهيل (Stories/tactics)
    emergency.tsx       - فزعة (Emergency contacts)
  prep-gear.tsx         - زهبة الركيب (Prep gear checklists)
  star-guide.tsx        - دليل النجوم (Star navigation)
  guide-detail.tsx      - Individual guide item detail
  settings.tsx          - App settings
data/
  wisdom.json           - Content brain (all app content)
constants/
  colors.ts             - Theme colors (navy + gold)
```

## Brand Colors
- Navy (primary bg): #0A1628
- Navy Light (cards): #152238
- Gold (accent): #D4AF37
- Text: White / rgba variants

## Key Features
1. Home dashboard with weather alerts + daily tips
2. Smart checklists with offline persistence
3. Field guide (creatures, plants, hazards)
4. Star navigation education
5. Campfire stories and tactics
6. Emergency contacts + GPS location sharing
7. Settings with toggle controls

## Adding Content
Edit `data/wisdom.json` to add new:
- Field guide items in `categories.fieldGuide.sections[].items[]`
- Stories in `categories.stories.items[]`
- Prep gear items in `categories.prepGear.tripTypes[].items[]`
- Star guide items in `categories.starGuide.items[]`
- Emergency contacts in `categories.emergency.contacts[]`
- Daily tips in `categories.dailyTips[]`
