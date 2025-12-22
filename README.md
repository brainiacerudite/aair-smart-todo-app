# 🎯 Smart Todo App - AI-Powered Task Management

A modern, feature-rich React Native todo application with **AI-powered voice transcription** and intelligent task splitting. Built with TypeScript, Zustand state management, and Expo for cross-platform compatibility.

## ✨ Features

### Core Functionality

- ✅ **Create, Edit, and Delete Tasks** - Full CRUD operations with form-based task entry
- 🎙️ **Voice-to-Task with AI** - Record voice and let AI transcribe and intelligently split multiple tasks
- 🔍 **Search & Filter** - Real-time search across task titles and descriptions
- 📊 **Smart Sorting** - Sort by title (A-Z/Z-A) or due date (earliest/latest)
- ✏️ **Edit Mode** - Tap any task to edit its details
- 📅 **Due Date Picker** - Native date picker with minimum date validation
- 🗑️ **Swipe to Delete** - Intuitive gesture with visual hint
- ✅ **Toggle Completion** - Mark tasks as done/undone with checkbox

### Advanced Features (Bonus)

- 🌓 **Dark Mode Support** - Seamless light/dark theme switching
- 🤖 **Multi-Provider AI** - Supports OpenAI, Gemini, and Deepgram for voice transcription
- 🎨 **Voice Split Modal** - Review AI-suggested task splits before saving
- 💾 **Persistent Storage** - Tasks saved locally using AsyncStorage
- 🎭 **Smooth Animations** - React Native Reanimated for polished UX
- 🔄 **Real-time Updates** - Instant UI updates with Zustand reactive state

### Split Workflow

- **Header (+) Icon**: Opens form-based "Add Task" screen for manual entry
- **FAB (Microphone)**: Opens voice modal for quick voice-based task creation

## 🏗️ Architecture

### State Management - Zustand

Chose **Zustand** for its simplicity, TypeScript support, and minimal boilerplate:

- **Small Bundle Size** (~1KB vs Redux's ~3KB)
- **No Context Providers** - Direct access to store from any component
- **Built-in Persistence** - Seamless AsyncStorage integration
- **Reactive Updates** - Components re-render only when their selected state changes
- **DevTools Compatible** - Easy debugging

### Project Structure

```
src/
├── api/                    # API client configurations
│   ├── deepgramClient.ts   # Deepgram API setup
│   ├── geminiClient.ts     # Google Gemini API setup
│   └── openAIClient.ts     # OpenAI API setup
├── components/             # Reusable UI components
│   ├── AppText.tsx         # Themed text component
│   ├── FAB.tsx             # Floating Action Button
│   ├── FilterModal.tsx     # Sort options modal
│   ├── TaskItem.tsx        # Individual task card
│   ├── VoiceModal.tsx      # Voice recording modal
│   └── VoiceSplitModal.tsx # AI task split review modal
├── hooks/                  # Custom React hooks
│   ├── useTaskProcessor.ts # AI transcription & parsing logic
│   └── useVoiceRecorder.ts # Voice recording management
├── navigation/             # Navigation configuration
│   └── RootNavigator.tsx   # Stack navigator setup
├── screens/                # App screens
│   ├── AddTaskScreen.tsx   # Form-based task creation/editing
│   └── TaskListScreen.tsx  # Main task list with search/filter
├── services/               # Business logic & services
│   └── ai/                 # AI service implementations
│       ├── deepgramService.ts
│       ├── geminiService.ts
│       ├── openAIService.ts
│       └── index.ts        # AI provider selector
├── store/                  # Zustand state management
│   ├── useTaskStore.ts     # Task state & actions
│   └── useThemeStore.ts    # Theme state & actions
├── theme/                  # Design system
│   ├── colors.ts           # Color palette
│   └── spacing.ts          # Spacing constants
├── types/                  # TypeScript interfaces
│   └── index.ts            # Global type definitions
└── utils/                  # Utility functions
    └── aiParser.ts         # Task parsing utilities
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- API Keys from at least one provider:
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [Google Gemini API Key](https://makersuite.google.com/app/apikey)
  - [Deepgram API Key](https://console.deepgram.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SmartTodoApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the project root by copying the example:

   ```bash
   cp .env.example .env
   ```

   Open `.env` and add your API keys:

   ```env
   EXPO_PUBLIC_OPENAI_API_KEY="sk-your-openai-key-here"
   EXPO_PUBLIC_GEMINI_API_KEY="your-gemini-key-here"
   EXPO_PUBLIC_DEEPGRAM_API_KEY="your-deepgram-key-here"
   ```

   **Get API Keys:**

   - OpenAI: https://platform.openai.com/api-keys
   - Gemini: https://makersuite.google.com/app/apikey
   - Deepgram: https://console.deepgram.com/

   **Note:** You only need ONE API key from any provider. The app will automatically use the first available provider. Then set the `AIChoice` in `src/services/ai/index.ts`

4. **Start the development server**

   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Run on your device**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Test Coverage

```bash
npm test -- --coverage
```

The test suite includes comprehensive tests for:

- Task CRUD operations
- State management logic
- Search and filter functionality
- Sort operations
- Data persistence

## 📱 Usage Guide

### Adding Tasks

**Method 1: Manual Entry (Header + Icon)**

1. Tap the **+** icon in the top-right header
2. Fill in task details:
   - Title (required)
   - Description (optional)
   - Due Date (optional)
3. Use the mic icon in the title field for voice dictation
4. Tap "Add Task" to save

**Method 2: Voice Entry (FAB)**

1. Tap the **microphone FAB** (Floating Action Button)
2. Record your task(s) - can mention multiple tasks in one recording
3. AI will transcribe and suggest task splits
4. Choose to save as:
   - Single task (original transcription)
   - Multiple tasks (AI-split suggestions)

### Managing Tasks

- **Complete**: Tap the checkbox
- **Edit**: Tap anywhere on the task card
- **Delete**: Swipe left and tap the delete icon
- **Search**: Type in the search bar
- **Sort**: Tap the filter icon to choose sort order

## 🛠️ Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **State Management**: Zustand with persist middleware
- **Navigation**: React Navigation (Stack Navigator)
- **UI/Animations**: React Native Reanimated, React Native Gesture Handler
- **Storage**: AsyncStorage
- **AI Services**: OpenAI GPT-4, Google Gemini, Deepgram
- **Date Picker**: @react-native-community/datetimepicker

## 🎨 Design Features

- **Responsive Layout**: Adapts to different screen sizes
- **Theme Support**: System-aware light/dark mode
- **Smooth Animations**: 60fps animations for delightful UX
- **Visual Feedback**: Loading states, success/error alerts
- **Accessibility**: Proper contrast ratios and touch targets

## 📝 Future Enhancements

- [ ] Task categories/tags
- [ ] Recurring tasks
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Task sharing and collaboration
- [ ] Notifications for due dates
- [ ] Task priority levels
- [ ] Statistics and productivity insights

## 🤝 Contributing

This is a code challenge submission. For evaluation purposes only.

## 📄 License

MIT
