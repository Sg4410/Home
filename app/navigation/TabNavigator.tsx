import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerShown: false // Hide the navigation header
        }}
      />
    </Stack.Navigator>
  );
};

export default TabNavigator;
