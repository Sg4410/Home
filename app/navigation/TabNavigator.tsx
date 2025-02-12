
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LockScreen from '../screens/LockScreen';
import RenderScreen from '../screens/RenderScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lock" component={LockScreen} />
      <Tab.Screen name="Render Screen" component={RenderScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
