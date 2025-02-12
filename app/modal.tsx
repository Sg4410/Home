import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect} from 'react';
import { Platform, StyleSheet, Button, TextInput, Alert } from 'react-native';
import { Text, View } from '@/app/components/Themed';
import { auth } from "./components/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function ModalScreen() {
  return (
    <View>
      <Text>
        Test
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 8,
    color: "white"
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
