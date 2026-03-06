# Sehail (سهيل) - Saudi Outdoor Companion App

## Overview
A Saudi outdoor companion app for hiking, camping, desert, and sea trips. Provides knowledge and preparation, not direct rescue. Follows an offline-first, data-driven architecture with Arabic RTL layout.

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
- **Environment Tags**: All content items have an `environment` field: "land", "sea", or "shared". Land items show 🏜️ badge, sea items show 🌊 badge, shared items show no badge.

## File Structure
```
app/
  _layout.tsx           - Root layout with fonts, providers, splash
  (tabs)/
    _layout.tsx         - Tab navigation (4 tabs)
    index.tsx           - المجلس (Home dashboard)
    guide.tsx           - معلومات (Field guide with env badges)
    stories.tsx         - سوالف سهيل (Stories with env badges)
    emergency.tsx       - فزعة (Emergency contacts + tools)
  prep-gear.tsx         - إحتياجات الرحلة (Prep gear - land & sea)
  star-guide.tsx        - دليل الملاحة (Navigation guide - stars, compass, land, sea, digital, disoriented)
  guide-detail.tsx      - Individual guide item detail
  settings.tsx          - App settings
components/
  LogoHeader.tsx        - Inline logo header with gold underline
  AppSplash.tsx         - Animated splash screen
data/
  wisdom.json           - Content brain (all app content)
constants/
  colors.ts             - Theme colors
assets/images/
  sehail-logo.png       - Gold star logo
  ad-banner.png         - Ad banner image
```

## Design System
- **Background**: Light (#F5F5F0) page, white cards
- **Primary color**: Saudi Green (#006C35)
- **Accent color**: Gold (#D4AF37)
- **Padding**: 14px horizontal on all screens
- **Cards**: White bg, light border, rounded 16px, env badge top-left
- **StatusBar**: dark mode
- **Tab labels**: المجلس, معلومات, سوالف, فزعة

## Content Structure in wisdom.json
- `categories.prepGear.tripTypes[]` - 7 trip types (3 land, 2 sea, 2 shared) with checklists
- `categories.fieldGuide.sections[]` - creatures (land + sea), plants (land), hazards (land + sea)
- `categories.navigationGuide.sections[]` - 6 sections: stars, compass, reading land, marine nav, digital tools, disoriented
- `categories.stories.items[]` - 18 stories with category (سلامة/مهارة/معرفة) and environment tags
- `categories.emergency` - contacts + messageTemplate + locationGuide + reportingGuide + batteryManagement + seaEmergency
- `categories.dailyTips[]` - 25 tips as objects with text and environment fields

## Key Features
1. Home dashboard with daily tips + ad banner
2. Smart checklists with offline persistence (land + sea)
3. Field guide (creatures, plants, hazards) with env badges
4. Navigation guide (stars, compass, land reading, marine nav, digital tools, orientation recovery)
5. Stories and tactics (18 entries across land/sea/shared)
6. Emergency contacts + message template + location sharing guide + reporting guide + battery management + sea emergency
7. Animated splash screen with logo
8. Settings with toggle controls
