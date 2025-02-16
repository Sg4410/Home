import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface DeviceTileProps {
  name: string;
  icon: string;
  status: string;
  onPress?: () => void;
}

const DeviceTile = ({ name, icon, status, onPress }: DeviceTileProps) => {
  return (
    <TouchableOpacity style={styles.deviceTile} onPress={onPress}>
      <View style={styles.deviceIcon}>
        <Text style={styles.deviceIconText}>{icon}</Text>
      </View>
      <Text style={styles.deviceName}>{name}</Text>
      <Text style={styles.deviceStatus}>{status}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceTile: {
    width: '48%',
    backgroundColor: '#242424',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  deviceIconText: {
    fontSize: 24,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  deviceStatus: {
    fontSize: 14,
    color: '#808080',
  },
});

export default DeviceTile; 