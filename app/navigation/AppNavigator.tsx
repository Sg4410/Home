
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../components/AuthContext';
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import { ActivityIndicator, View } from 'react-native';

const AppNavigator = () => {
  const { user } = useAuth();

  if (user === undefined) {
    // Loading state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
