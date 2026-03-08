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
- **Environment Tags**: All content items have an `environment` field: "land", "sea", or "shared". Land items show sunny-outline icon, sea items show water-outline icon, shared items show no badge.

## File Structure
```
app/
  _layout.tsx           - Root layout with fonts, providers, splash
  (tabs)/
    _layout.tsx         - Tab navigation (4 tabs)
    index.tsx           - المجلس (Home dashboard + tip + streak + discovery + section grid)
    guide.tsx           - معلومات (Field guide with env badges + read markers)
    stories.tsx         - سوالف سهيل (Stories with env badges + favorites + read markers)
    emergency.tsx       - فزعة (Emergency contacts + tools)
  prep-gear.tsx         - إحتياجات الرحلة (Prep gear + share readiness + trip counter)
  star-guide.tsx        - دليل الملاحة (Navigation guide - 6 sections)
  first-five.tsx        - أول ٥ دقائق (Emergency step cards)
  quick-id.tsx          - تعرّف بسرعة (Quick creature/hazard ID)
  guide-detail.tsx      - Individual guide item detail (with read tracking + favorites)
  favorites.tsx         - المفضلة (Saved favorites screen)
  quiz.tsx              - الكويز (Interactive quiz system - 3 quizzes, 20 questions)
  badges.tsx            - الإنجازات (Achievement badges grid - 9 badges)
  compass.tsx           - البوصلة والموقع (Compass + GPS waypoints)
  settings.tsx          - App settings
lib/
  read-tracker.ts       - Read tracking utility (markAsRead, getReadItems, isRead)
  favorites.ts          - Favorites utility (toggleFavorite, getFavorites, isFavorite)
  query-client.ts       - React Query client
components/
  LogoHeader.tsx        - Inline logo header with gold underline
  AppSplash.tsx         - Animated splash screen
  ErrorBoundary.tsx     - Error boundary wrapper
data/
  wisdom.json           - Content brain (all app content including quizzes)
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
- **Cards**: White bg, light border, rounded 16px, env icon top-left (Ionicons sunny-outline/water-outline)
- **StatusBar**: dark mode
- **Tab labels**: المجلس, معلومات, سوالف, فزعة
- **Sub-screen headers**: Green bg (#006C35), gold tint, Cairo_700Bold title
- **Icons**: Always Ionicons (outline for inactive/secondary, filled for active). NO emojis as UI badges.

## Content Structure in wisdom.json
- `categories.prepGear.tripTypes[]` - 7 trip types (3 land, 2 sea, 2 shared) with checklists
- `categories.fieldGuide.sections[]` - creatures (land + sea), plants (land), hazards (land + sea)
- `categories.navigationGuide.sections[]` - 6 sections: stars, compass, reading land, marine nav, digital tools, disoriented
- `categories.stories.items[]` - 18 stories with category (سلامة/مهارة/معرفة) and environment tags
- `categories.emergency` - contacts + messageTemplate + locationGuide + reportingGuide + batteryManagement + seaEmergency
- `categories.dailyTips[]` - 25 tips as objects with text and environment fields
- `categories.firstFiveMinutes.entries[]` - 6 emergency step-by-step cards
- `categories.quizzes.sections[]` - 3 quiz sections (safety 8q, navigation 6q, environment 6q = 20 total)

## Key Features
1. Home dashboard with interactive daily tips + ad banner
2. Learning streak (Duolingo-style) with 7-day indicators
3. Smart checklists with offline persistence (land + sea) + share readiness on completion
4. "First 5 Minutes" emergency step cards
5. "Quick ID" - fast creature/hazard identification grid
6. Field guide (creatures, plants, hazards) with env badges + read tracking
7. Navigation guide (stars, compass, land reading, marine nav, digital tools, orientation recovery)
8. Stories and tactics (18 entries) with favorites + read tracking
9. Emergency contacts + message template + location sharing + reporting + battery management + sea emergency
10. Animated splash screen with logo
11. Settings with toggle controls
12. **Trip counter** - tracks completed trips with full gear preparation
13. **Knowledge counter** - tracks new tips learned
14. **Read tracking** - marks viewed content with checkmarks, shows discovery % on home
15. **Favorites system** - star toggle on guide items and stories, dedicated favorites screen
16. **Quiz system** - 3 quizzes (20 questions) with scoring, best scores, share results
17. **Achievement badges** - 9 badges with unlock conditions (checklist, quiz, streak, reading)
18. **Compass + GPS waypoints** - device compass (native only) + save/load/delete location points

## AsyncStorage Keys
- `sehail_checklist` - Checklist item completion state (object: {itemId: boolean})
- `sehail_streak` - Learning streak data ({count: number, lastDate: string, history: string[]})
- `sehail_settings` - User settings (weatherAlerts, dailyTips toggles)
- `sehail_trips_completed` - Number of trips completed with full gear (number)
- `sehail_new_tips_count` - Number of new tips learned (number)
- `sehail_read_items` - Array of read item IDs (string[])
- `sehail_favorites` - Array of favorited item IDs (string[])
- `sehail_quiz_scores` - Quiz best scores ({quizId: {best: number, total: number}})
- `sehail_badges` - Array of unlocked badge IDs (string[])
- `sehail_saved_points` - Saved GPS waypoints (array of {name, lat, lng, time})
