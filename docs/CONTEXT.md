# ქ.ა.ლ.ა.ქ.ო.ბ.ა.ნ.ა (Qalaqobana) Online Game

## Overview

This document provides a complete roadmap and structured explanation of how to develop the Georgian browser game "ქალაქობანა" using modern web technologies with Cursor AI assistance. It includes app flow, features, and recommended tools.

## 🌐 Technologies and Tools

### Frontend (Angular-based)
- **Framework**: Angular
- **UI Library**: Tailwind CSS (with custom components) or ShadCN (ported for Angular)
- **State Management**: NgRx (or Component-level state for simpler flows)
- **Routing**: Angular Router
- **WebSockets**: Socket.io-client Angular integration

### Backend
- **Framework**: Node.js with Express
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Token)
- **Real-time Communication**: Socket.io

### Deployment
- **Frontend**: Vercel (using Angular SSR) / Netlify (via build output)
- **Backend**: Render / Railway / Fly.io
- **Database**: MongoDB Atlas

## 🔑 Core Features

### 1. User Registration/Login
- Email, username, password fields
- Stored securely in database with hashed passwords
- JWT-based authentication
- Angular reactive forms with validation

### 2. Landing Page
- Logo with stylish font
- Welcome message
- Two main actions: Create Table and Join Table
- Right corner: Register/Login buttons with Angular router links

### 3. Create Table
- Accessible after login
- Reactive form for selecting game deck categories (e.g., ქალაქი, სოფელი, სახელი, ცხოველი, მცენარე, etc.)
- Once categories selected → generate a unique room code
- Option to share the code with friends (copy/share via link)
- Wait room: real-time list of joined players using Socket.io
- Real-time chat enabled in room (chat module)

### 4. Join Table
- Enter room code to join an existing game
- Appear in waiting room with chat enabled (Socket.io)

### 5. Game Flow
- Host starts the game by clicking Start
- Angular service fetches a random Georgian letter from backend
- Each player sees a dynamic form with selected categories
- Players write answers that start with the selected letter
- One player clicks STOP to end the round
- All forms freeze → backend evaluates answers

### 6. Points System
- Empty answer → 0 points
- Same answer as another player → 5 points
- Unique answer → 10 points
- Results and leaderboard shown in Angular Material table or custom cards

### 7. Multiple Rounds
- Table creator clicks Start again
- New random letter is selected
- Continue until set round count or manual stop

### 8. Offline Mode
- Angular local storage / service to manage game state
- Solo or 2-3 player input system on same device
- No backend/socket dependency

### 9. Chat Feature
- Real-time chat in the game lobby and during rounds
- Socket.io channel per room
- Scrollable message window in Angular component

## 🗂️ Backend Structure

### Collections
- **Users**
  - id, username, email, hashed password
- **Rooms**
  - roomCode, players, creatorId, categories, currentLetter, roundData
- **Messages**
  - roomCode, senderId, message, timestamp

### Socket Events
- createRoom
- joinRoom
- startGame
- sendMessage
- submitAnswers
- stopRound
- calculateScores

## 🧪 Development Phases

### Phase 1: Setup and Authentication
- Angular + Node project skeleton
- Register/Login UI (Reactive Forms) and backend
- JWT tokens with Angular interceptors and protected routes

### Phase 2: Game Lobby and Room System
- Create and Join Table components
- Room handling in MongoDB
- Real-time updates via Socket.io Angular client

### Phase 3: Game Mechanics
- Random Georgian letter generator (backend utility)
- Angular forms rendered dynamically by chosen categories
- Timer component + Stop trigger
- Backend logic to evaluate answers and score

### Phase 4: Chat and UX Polishing
- Chat module for game lobby and room
- Tailwind animations, mobile responsiveness
- Angular form validation and feedback messages

### Phase 5: Offline Mode
- Angular-only local play mode
- Multiple player forms on single screen
- Local score calculation

### Phase 6: Deployment
- Angular build deployed to Vercel or Netlify
- Backend API on Render / Fly.io
- MongoDB Atlas connection

## 🔡 Georgian Alphabet Helper

```javascript
const alphabet = ["ა", "ბ", "გ", "დ", "ე", "ვ", "ზ", "თ", "ი", "კ", "ლ", "მ", "ნ", "ო", "პ", "ჟ", "რ", "ს", "ტ", "უ", "ფ", "ქ", "ღ", "ყ", "შ", "ჩ", "ც", "ძ", "წ", "ჭ", "ხ", "ჯ", "ჰ"];

function getRandomLetter(exclude = []) {
  const available = alphabet.filter(l => !exclude.includes(l));
  return available[Math.floor(Math.random() * available.length)];
}
```

## ✅ Bonus Features (Optional)
- Audio countdown before round ends
- Emoji reactions in chat
- Game replays / answer summaries
- Share room/results on social media

## 🧠 Final Notes

This game is designed for fun, engagement, and light competition. Focus on:
- Simplicity of UI (Tailwind + Angular Components)
- Clean and reactive design
- Low-latency real-time actions
- Fun and Georgian cultural vibes

Let's build the best version of "ქალაქობანა" online 🌟🇬🇪
