import React, { useState } from "react";
import { Text, View, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../components/firebaseConfig"
import { useAuth } from '../components/AuthContext';

// Initialize Firebase
const db = getDatabase(app);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to write motor state to Firebase
function writeMotorData(uid: string, state: number) {
  set(ref(db, "/UsersData/"+uid+"/lock-surya-apt/state"), state).catch((error) => {
    Alert.alert("Error", error.message);
  });
}

export default function LockScreen() {
  const { user } = useAuth();
  const [lockedState, setLockedState] = useState("Locked");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Handle Lock/Unlock Button Press
  const toggleLock = async () => {
    if (isButtonDisabled) return;
    
    
    if (lockedState === "Locked") {
      writeMotorData(user.uid, 2); // Start unlocking
      setLockedState("Unlocked");
    } else { 
      writeMotorData(user.uid, 1); // Start unlocking
      setLockedState("Locked");
    }

    setIsButtonDisabled(true);
    // Re-enable button after 3 seconds
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {/* Lock Status Indicator */}
      <View style={styles.indicatorContainer}>
        <Text style={styles.indicatorText}>
          {lockedState === "Locked" ? "🔒 Locked" : "🔓 Unlocked"}
        </Text>
      </View>

      {/* Lock/Unlock Button */}
      <TouchableOpacity
        onPress={toggleLock}
        disabled={isButtonDisabled}
        style={[
          styles.button,
          lockedState === "Locked" ? styles.unlockButton : styles.lockButton,
          isButtonDisabled && styles.disabledButton, // Add disabled style
        ]}
      >
        <Text style={styles.buttonText}>
          {lockedState === "Locked" ? "Unlock" : "Lock"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  indicatorContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  indicatorText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  lockButton: {
    backgroundColor: "#4CAF50", // Green for "Unlock"
  },
  unlockButton: {
    backgroundColor: "#F44336", // Red for "Lock"
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
});