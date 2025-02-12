/app
  |_ tabs/                   # Contains all your tab-related screens
      |_ _layout.tsx         # Layout for tab navigation
      |_ index.tsx           # Default tab screen
      |_ lock.tsx            # Lock screen
  
  |_ components/             # Shared components used across the app
      |_ AuthContext.tsx     # Context for authentication (NEW)
      |_ EditScreenInfo.tsx
      |_ ExternalLink.tsx
      |_ StyledText.tsx
      |_ Themed.tsx

  |_ constants/              # Constants like colors, reusable variables, etc.
      |_ Colors.ts

  |_ home/                   # Group all home-related files
      |_ Home.tsx

  |_ firebaseConfig.ts       # Firebase configuration and initialization

  |_ state/                  # NEW DIRECTORY for state management
      |_ AuthContext.tsx     # Manages auth state across the app
      |_ useAuth.ts          # Hook for accessing auth state in functional components
      |_ SecureStore.ts      # Handles secure token storage (optional)

  |_ utils/                  # Utility functions/helpers
      |_ helpers.ts          # Miscellaneous reusable functions
      |_ validations.ts      # Validation functions like email or password validation

  |_ App.tsx                 # Entry point of the app
  |_ navigation/             # NEW DIRECTORY for navigation
      |_ AppNavigator.tsx    # Handles all navigation stacks
      |_ TabNavigator.tsx    # Tab-based navigation