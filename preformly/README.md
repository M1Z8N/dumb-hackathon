# PREFORMLY
### 67% More Performative Than Your Ex

Tinder for performative people. Swipe nearby fits, match, and let the AI rizz agent talk for you.

## 90-Second Demo Script

### Setup (before demo)
```bash
cd preformly
npm install
npx expo start
# Press 'i' for iOS simulator
```

### Demo Flow

1. **SWIPE & MATCH (30 sec)**
   - Open app showing main swipe screen
   - Swipe left on first card (Blake)
   - Swipe right on Madison (auto-matches)
   - Match modal appears
   - Tap "RIZZ FOR ME"
   - Show generated opener and follow-ups
   - Tap to copy opener
   - Tap "CONTACT" to show link handling

2. **SCAN TO SCORE (30 sec)**
   - Navigate to Scan tab
   - Take photo or choose from gallery
   - Select enhancement style (e.g., "Matcha Aesthetic" or "Indie Soft Girl")
   - Enter custom prompt (e.g., "Add matcha latte and labubu doll")
   - Tap "Create Enhanced Photo" (requires API key setup)
   - Show before/after comparison with AI-generated image
   - Point out score increase and tech culture analysis

3. **MAP VIEW (20 sec)**
   - Navigate to Map tab
   - Show hotspot pins with scores
   - Tap "Blue Bottle Coffee" pin
   - Show 89 avg score and top profiles
   - Mention "67% MatchaLover probability"

4. **CLOSING (10 sec)**
   - "Opt-in only, no scraping"
   - "Nano Bana powered image editing"
   - "Gloriously useless and fully demoable"

## Key Features

### Core Loop
- **Swipe**: Location-based card deck with Preformance Scores
- **Match**: Auto-match on certain profiles for demo
- **Rizz Agent**: AI-generated openers with personality
- **Contact**: Opt-in links only

### Scan to Score (Gemini 2.5 Flash Image Integration)
- Upload or capture photo
- AI analysis of "performative" tech culture traits
- Real image generation with Gemini 2.5 Flash Image
- Add elements like matcha drinks, labubu dolls, Clairo/Laufey aesthetics
- Score calculation based on tech culture performativity

### Map
- 5 seeded hotspots near venue
- Average Preformance Scores
- Top profiles per location
- Fun stats (MatchaLover probability)

## Architecture

```
Preformly (Expo React Native)
├── Swipe Screen with gesture handling
├── Match Modal with Rizz Agent
├── Scan Screen with camera & image generation
├── Map Screen with hotspots
├── GeminiService for AI integration
└── Local seed data for offline demo

Core Features:
├── Gemini 2.5 Flash Image for photo enhancement
├── Gemini 2.0 Flash for analysis & chat
├── Real-time image editing (matcha drinks, etc.)
└── Tech culture scoring system
```

## Setup & API Configuration

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Replace `YOUR_GOOGLE_API_KEY_HERE` in `app.json` with your actual key:

```json
{
  "extra": {
    "googleApiKey": "your_actual_api_key_here"
  }
}
```

### 2. Install & Run

```bash
# Install dependencies
npm install

# Start Expo
npx expo start

# iOS Simulator
# Press 'i' in terminal

# Android Emulator
# Press 'a' in terminal

# Physical device
# Scan QR code with Expo Go app
```

## Seed Data

The app includes 8 pre-seeded profiles with auto-match flags for demo reliability:
- Madison (auto-match)
- Jordan (auto-match)
- Atlas (auto-match)

## Privacy & Consent

- Profiles are opt-in only
- Contact links are user-shared
- No scraping or tracking
- Image edits on user photos only

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- Expo Image Picker
- React Native Maps
- Gesture Handler for swipes

## Demo Tips

1. **Network**: App works offline with seed data
2. **Timing**: Practice the 90-second flow
3. **Backup**: Have screenshots ready if live demo fails
4. **Energy**: Lead with confidence, it's meant to be absurd

Remember: It's gloriously useless and that's the point.