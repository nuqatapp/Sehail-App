# Sehail App — Developer Guide

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Start with dev client (recommended for native features)
npx expo start --dev-client

# Run on specific platform
npx expo run:ios
npx expo run:android
```

## Adding a New Screen

### Step 1 — Create the file

Create `app/my-screen.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ColorTokens, Space, FontFamily, FontSize } from '@/constants/designTokens';

export default function MyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'عنوان الشاشة', headerShown: true }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>مرحبا</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorTokens.background.default,
  },
  content: {
    padding: Space[4],
  },
  title: {
    fontFamily: FontFamily.cairo.bold,
    fontSize: FontSize['2xl'],
    color: ColorTokens.text.primary,
    textAlign: 'right',
  },
});
```

### Step 2 — Link to it

Navigate with Expo Router's typed routes:

```tsx
import { router } from 'expo-router';
router.push('/my-screen');

// Or as a link:
import { Link } from 'expo-router';
<Link href="/my-screen">اذهب</Link>
```

### Step 3 — Add to tab bar (if a main tab)

Edit `app/(tabs)/_layout.tsx` and add a `<Tabs.Screen>` entry.

---

## Adding a New Component

### Step 1 — Create in `components/`

```tsx
// components/MyCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColorTokens, Space, Radius, Elevation, FontFamily, FontSize } from '@/constants/designTokens';

interface MyCardProps {
  title: string;
  subtitle?: string;
  dir?: 'rtl' | 'ltr';
  testID?: string;
}

export function MyCard({ title, subtitle, dir = 'rtl', testID }: MyCardProps) {
  return (
    <View style={styles.card} testID={testID}>
      <Text style={[styles.title, { textAlign: dir === 'rtl' ? 'right' : 'left' }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { textAlign: dir === 'rtl' ? 'right' : 'left' }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorTokens.surface.card,
    borderRadius: Radius.md,
    padding: Space[4],
    ...Elevation[2],
  },
  title: {
    fontFamily: FontFamily.cairo.semiBold,
    fontSize: FontSize.lg,
    color: ColorTokens.text.primary,
  },
  subtitle: {
    fontFamily: FontFamily.cairo.regular,
    fontSize: FontSize.sm,
    color: ColorTokens.text.secondary,
    marginTop: Space[1],
  },
});
```

### Step 2 — Document it

Add the component to `components/COMPONENTS.md` with:
- Purpose
- Props table (name, type, required, default, description)
- Usage example
- Accessibility notes

### Rules for Components

- No API calls or AsyncStorage access inside components
- Accept a `dir` prop and respect text alignment
- Use only `constants/designTokens.ts` — never `colors.ts` or raw hex
- Every interactive element needs `accessibilityLabel`
- Minimum 44×44px touch targets (use `ComponentSize.minTouchTarget`)

---

## Adding Content to the App

All content lives in `data/wisdom.json`. No code changes are needed for most content additions.

### Adding a Story

In `data/wisdom.json`, find the `"stories"` array and add:

```json
{
  "id": "story-unique-id",
  "title": "عنوان القصة",
  "category": "سلامة",
  "env": ["desert"],
  "summary": "ملخص القصة...",
  "content": "محتوى القصة الكامل...",
  "tags": ["tag1", "tag2"]
}
```

### Adding a Field Guide Item

Find the correct category inside `"fieldGuide"` and add:

```json
{
  "id": "item-unique-id",
  "name": "اسم العنصر",
  "env": ["sunny", "water"],
  "description": "وصف العنصر",
  "danger": "medium",
  "tips": ["نصيحة ١", "نصيحة ٢"]
}
```

### Adding a Quiz Question

Find the correct quiz section inside `"quizzes"` and add:

```json
{
  "id": "q-unique-id",
  "question": "ما هو السؤال؟",
  "options": ["خيار ١", "خيار ٢", "خيار ٣", "خيار ٤"],
  "correctIndex": 0,
  "explanation": "شرح الإجابة الصحيحة"
}
```

---

## Common Patterns

### Reading from wisdom.json

```tsx
import wisdomData from '@/data/wisdom.json';
// Use proper types once types/wisdom.ts is created
const stories = (wisdomData as any).stories as Story[];
```

Once `types/wisdom.ts` exists (see Roadmap):

```tsx
import wisdomData from '@/data/wisdom.json';
import type { WisdomData } from '@/types/wisdom';
const data = wisdomData as WisdomData;
const stories = data.stories;
```

### Reading / Writing AsyncStorage

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Read on mount
useEffect(() => {
  AsyncStorage.getItem('sehail_my_key').then(raw => {
    if (raw) setMyState(JSON.parse(raw));
  }).catch(() => {}); // always provide a fallback
}, []);

// Write on change
const save = async (value: MyType) => {
  await AsyncStorage.setItem('sehail_my_key', JSON.stringify(value));
};
```

Use the helpers in `lib/favorites.ts` and `lib/read-tracker.ts` as templates.

### Using Design Tokens

```tsx
import {
  ColorTokens,
  Space,
  FontFamily,
  FontSize,
  Radius,
  Elevation,
  Duration,
  Opacity,
} from '@/constants/designTokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorTokens.background.default,
    padding: Space[4],              // 16px
  },
  card: {
    borderRadius: Radius.lg,        // 16px
    ...Elevation[2],                // platform shadow
  },
  title: {
    fontFamily: FontFamily.cairo.bold,
    fontSize: FontSize.xl,
    color: ColorTokens.text.primary,
  },
  disabled: {
    opacity: Opacity.disabled,      // 0.4
  },
});
```

### Navigating Between Screens

```tsx
import { router, useLocalSearchParams } from 'expo-router';

// Navigate with params
router.push({ pathname: '/guide-detail', params: { itemId: 'abc123' } });

// Read params in destination screen
const { itemId } = useLocalSearchParams<{ itemId: string }>();
```

### Using Modal

```tsx
import { useState } from 'react';
import { Modal } from '@/components/Modal';

const [showModal, setShowModal] = useState(false);

<Modal
  isVisible={showModal}
  onClose={() => setShowModal(false)}
  title="تأكيد"
  size="sm"
>
  <Text>هل أنت متأكد؟</Text>
</Modal>
```

### Using Toast

```tsx
import { useState } from 'react';
import { Toast } from '@/components/Toast';

const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onDismiss={() => setToast(null)}
  />
)}

// Trigger:
setToast({ message: 'تم الحفظ', type: 'success' });
```

---

## Migration Strategy: colors.ts → designTokens.ts

### Current State

Two token files exist. Many screens still import from the legacy `colors.ts`.

### Migration Steps (per screen)

1. Open the screen file
2. Find all `import { colors } from '@/constants/colors'` or `import colors from '@/constants/colors'`
3. Replace with the appropriate `designTokens` imports:

```tsx
// Before
import { colors } from '@/constants/colors';
backgroundColor: colors.background

// After
import { ColorTokens } from '@/constants/designTokens';
backgroundColor: ColorTokens.background.default
```

4. Find all raw hex values (e.g., `'#FFFFFF'`, `'#1B5E20'`) and replace with token equivalents
5. Test the screen visually

### Token Mapping (colors.ts → designTokens.ts)

| colors.ts | designTokens.ts |
|-----------|----------------|
| `colors.primary.green` | `ColorTokens.brand.green` |
| `colors.primary.gold` | `ColorTokens.brand.gold` |
| `colors.background` | `ColorTokens.background.default` |
| `colors.card` | `ColorTokens.surface.card` |
| `colors.text.primary` | `ColorTokens.text.primary` |
| `colors.text.secondary` | `ColorTokens.text.secondary` |
| `colors.status.success` | `ColorTokens.semantic.success` |
| `colors.status.danger` | `ColorTokens.semantic.danger` |
| `colors.status.warning` | `ColorTokens.semantic.warning` |

---

## Phase-by-Phase Roadmap

### Phase 1 — Type Safety (Highest Priority)

1. Create `types/wisdom.ts` — TypeScript interfaces for `wisdom.json`
2. Update all screens to use typed data (remove `as any` casts)
3. Create `types/models.ts` — shared types (Badge, Quiz, Story, CreatureItem, etc.)

### Phase 2 — Design System Completion

1. Build `components/Button.tsx` (primary, secondary, ghost, danger)
2. Build `components/Card.tsx` (with size variants)
3. Build `components/Badge.tsx` and `components/Chip.tsx`
4. Build `components/Divider.tsx`, `components/EmptyState.tsx`, `components/LoadingSpinner.tsx`
5. Complete migration from `colors.ts` to `designTokens.ts` in all screens
6. Delete `constants/colors.ts` once migration is complete

### Phase 3 — Accessibility

1. Audit all interactive elements in screens for missing `accessibilityLabel`
2. Add `accessibilityRole` to all cards, buttons, links
3. Add `accessibilityState` for disabled/selected/checked states
4. Test with iOS VoiceOver and Android TalkBack

### Phase 4 — Backend

1. Implement API routes in `server/routes.ts`
2. Wire Drizzle ORM to PostgreSQL database
3. Create `services/` layer for abstracted data access
4. Implement user account (login, sync progress to cloud)

### Phase 5 — Performance & Quality

1. Add TypeScript types to all AsyncStorage reads/writes (Zod parsing)
2. Extract subcomponents from large screens (quiz, compass, home — each 600+ LOC)
3. Add unit tests for `lib/` utilities
4. Add E2E tests for main user flows
5. Analyze bundle size, enable lazy loading for heavy screens

---

## Rollback Strategy

Before any refactoring:

```bash
git checkout -b refactor/my-change
# do work
git add .
git commit -m "refactor: describe what changed"
# if it breaks, rollback to main
git checkout main
```

Never work directly on `main`. Each phase should be a separate branch and PR.

---

## TypeScript Tips

### Type a wisdom.json category

```typescript
// types/wisdom.ts
export interface Story {
  id: string;
  title: string;
  category: 'سلامة' | 'مهارة' | 'معرفة';
  env: Array<'desert' | 'water' | 'mountain' | 'general'>;
  summary: string;
  content: string;
  tags: string[];
}
```

### Type AsyncStorage reads

```typescript
const raw = await AsyncStorage.getItem('sehail_streak');
const streak: StreakData = raw ? JSON.parse(raw) : { count: 0, lastDate: null, history: [] };
```

### Remove `as any`

```typescript
// Before
const stories = (wisdomData as any).stories;

// After — once types/wisdom.ts exists
import type { WisdomData } from '@/types/wisdom';
const data = wisdomData as WisdomData;
const stories: Story[] = data.stories;
```
