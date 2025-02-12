
import React from 'react';
import { AuthProvider } from './components/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { registerRootComponent } from 'expo';
import "react-native-url-polyfill/auto";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

registerRootComponent(App);


