# Lunerie - UX Improvements & Product Design Document

## Implemented Improvements

### 1. PROFILE EXPERIENCE - Bio Prompts & Personality Cards

**What was added:**
- `BioPrompt` system with 12 structured prompts (e.g., "A perfect first date for me is...", "My hidden talent is...")
- Each profile has 1-2 answered prompts displayed as gradient cards
- New fields: `favoriteMusic`, `weekendActivity`, `pets`, `zodiac`, `mood`
- Mood system: adventurous, romantic, chill, social, creative - with emoji indicators

**How it works:**
- Prompts are displayed on ProfileDetailScreen as styled cards with the question in primary color and the answer below
- Music and weekend activities shown as colorful info-cards
- Users can express personality beyond just photos and bio

**UX Differentiation:** Unlike Tinder's plain bio or Hinge's generic prompts, Lunerie uses mood-based personality cards that change the matching algorithm.

---

### 2. CONVERSATION STARTERS (Icebreakers)

**What was added:**
- `generateIcebreakers()` function that creates 3 dynamic suggestions per profile
- Shown on ProfileDetailScreen under "Conversation Starters" section
- Shown on MatchPopup after a successful connection

**How they're generated:**
- Based on shared interests: "Ask Sophie about photography"
- Based on music taste: "Sophie loves Jazz. Ask about a favorite song!"
- Based on weekend activity: "Sophie enjoys hiking on weekends"
- Based on bio prompts: Uses prompt answers as conversation hooks
- Based on mood: "Sophie is feeling creative today"
- Based on pets: "Sophie has a cat! Ask for photos"
- Based on languages: "Sophie speaks 3 languages!"

**UX Impact:** Reduces "what do I say?" anxiety. Every match comes with actionable conversation starters.

---

### 3. PROFILE COMPLETENESS SYSTEM

**What was added:**
- `calculateProfileCompleteness()` function with 10 checkpoints
- Dynamic percentage calculation (not hardcoded)
- Color-coded progress bar (red < 50%, amber < 80%, green >= 80%)
- Actionable suggestions shown below the bar

**Checkpoints:**
1. At least 2 photos
2. Bio longer than 20 characters
3. At least 3 interests
4. At least 1 bio prompt answered
5. Favorite music added
6. Weekend activity added
7. Profile verified
8. Languages added
9. Mood set
10. Job title added

**UX Design:** Suggestions use warning icons and short text. Only top 2 suggestions shown to avoid overwhelming. Green = complete, amber = room to improve, red = needs attention.

---

### 4. COMPATIBILITY SCORING (Smart Discovery)

**What was added:**
- `calculateCompatibility()` function scoring 0-100% between two profiles
- Compatibility badge on SwipeCards (top-right corner)
- Compatibility badge on ProfileDetailScreen
- Compatibility badge on MatchPopup (center between photos)

**Scoring Algorithm:**
| Factor | Max Points | How Scored |
|--------|-----------|-----------|
| Shared interests | 30 | 6 points per shared interest |
| Relationship goal | 20 | Match = full points |
| Distance | 15 | Closer = more points |
| Shared languages | 10 | 5 points per shared language |
| Same mood | 10 | Match = full points |
| Lifestyle (smoking/drinking) | 10 | Match = 5 points each |
| Profile completeness | 5 | Based on other's profile quality |

**Visual Design:**
- Circular progress indicator with animated stroke
- Color-coded: green (80+), amber (60+), orange (40+), gray (<40)
- `CompatibilityBadge` reusable component with sm/md/lg sizes

---

### 5. ENHANCED MATCH EXPERIENCE

**What was improved:**
- Constellation effect: 15 floating stars with randomized positions and animation
- Reduced ripple circles to 3 for cleaner look
- Compatibility badge shown between profile pictures
- Shared interests displayed as translucent pills
- Icebreaker suggestion card shown after match
- Cleaner layout with better spacing

**Interaction Flow:**
1. Match triggers -> full-screen overlay with constellation stars
2. Profile pictures converge with spring animation
3. Compatibility score appears between photos (0.9s delay)
4. Shared interests fade in (1.0s delay)
5. Icebreaker suggestion slides up (1.2s delay)
6. "Say Hello" and "Keep Exploring" buttons appear (0.7s delay)

---

### 6. MOOD-BASED MATCHING

**What was added:**
- 5 moods: adventurous, romantic, chill, social, creative
- Mood emoji badges on SwipeCards
- Mood shown on ProfileDetailScreen with compatibility info
- Mood affects compatibility score (+10 points for matching moods)

**UX Concept:** Users set their current mood, and profiles with matching moods get a compatibility boost. This adds a dynamic, time-based element to discovery.

---

## Recommended Future Improvements

### 7. TRUST & SAFETY (Not yet implemented)
- Photo verification flow (take a selfie matching a pose)
- Report user with categories (fake profile, inappropriate content, harassment)
- Safety tips shown before first chat
- ID verification for premium badge
- AI-powered photo moderation

### 8. ADVANCED FILTERS UI (Partially implemented)
- Expandable filter sections with clean collapse/expand animation
- Zodiac filter
- Pets filter
- Music taste filter
- Activity level filter
- "Deal breaker" vs "nice to have" filter distinction

### 9. BETTER ONBOARDING (Partially implemented)
- Guided profile creation (not just info slides)
- Photo upload step
- Interest selection step
- Bio prompt answering step
- Mood setting step
- Progressive disclosure (don't ask everything at once)

### 10. UNIQUE UX DIFFERENTIATION IDEAS
- **Voice Profiles:** 15-second voice intro that plays when viewing a profile
- **Constellation Matching:** Visual representation of compatibility as connected stars
- **Story Mode:** 24-hour stories showing daily life (like Instagram but dating-focused)
- **Vibe Check:** Quick compatibility quiz between two matched users
- **Date Planner:** In-app date planning with venue suggestions
- **Mood Rooms:** Group discovery rooms based on current mood
- **Slow Dating Mode:** One match per day for deeper connections

---

## Technical Architecture Notes

### New Data Model
```typescript
interface BioPrompt { question: string; answer: string; }

// New Profile fields:
prompts: BioPrompt[]
mood: 'adventurous' | 'romantic' | 'chill' | 'social' | 'creative' | ''
favoriteMusic: string
weekendActivity: string
pets: 'none' | 'dog' | 'cat' | 'both' | 'other'
zodiac: string
compatibility?: number
```

### New Functions
- `generateIcebreakers(profile)` - Returns 3 conversation starters
- `calculateCompatibility(user, other)` - Returns 0-100 score
- `calculateProfileCompleteness(profile)` - Returns { percentage, suggestions }

### New Components
- `CompatibilityBadge` - Reusable circular progress indicator
- Enhanced `MatchPopup` - With compatibility, shared interests, icebreakers
- Enhanced `SwipeCard` - With compatibility badge and mood indicator
- Enhanced `ProfileDetailScreen` - With prompts, icebreakers, music/weekend cards
- Enhanced `ProfileScreen` - With dynamic completeness suggestions
