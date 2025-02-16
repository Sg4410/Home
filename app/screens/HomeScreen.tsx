import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { genAiApiKey, auth, app } from '../components/firebaseConfig';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import DeviceTile from '../components/DeviceTile';

// Initialize Firebase
const db = getDatabase(app);

const genAI = new GoogleGenerativeAI(genAiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" ,
  systemInstruction: "You are Arthur, a home assistant agent that interprets user commands. Your response must start with a strict JSON object in the format: { \"devices_controlled\": [/* array of devices /], \"action\": [/ corresponding actions */] }. Valid devices: \"blinds\", \"switch\", \"lock\". Allowed actions: \"turn on\", \"turn off\" (switch), \"open\", \"close\" (blinds), \"lock\", \"unlock\" (lock). Use context to determine if the user is inside or outside. If inside (e.g., \"I'm home\"), output \"lock\" (lock), \"turn on\" (switch), \"open\" (blinds). If outside (e.g., \"I'm leaving\"), output \"unlock\" (lock), \"turn off\" (switch), \"close\" (blinds). Ensure each action aligns with its corresponding device. If the device is not mentioned in the users commmand, do not include it in the JSON object. After the JSON object, include a concise, definitive summary of the overall actions, not specific devices. Example: \"The house is secured, and visibility to the outside is reduced.\" Not every device needs to be acted on, only the ones that are relevant to the user's command. For example, if the user says \"lock the door\" you should only lock the door, not the blinds or the switch."
});

const HomeScreen = () => {
  const { user, setUser } = useAuth();
  const [message, setMessage] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [devicesControlled, setDevicesControlled] = useState<string[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const writeLockState = async (uid: string, state: number) => {
    try {
      const lockRef = ref(db, `/UsersData/${uid}/lock-surya-apt/state`);
      await set(lockRef, state);
    } catch (error: any) {
      console.error('Lock state change failed:', error.message);
      setCurrentAnswer("Sorry, I couldn't change the lock state.");
    }
  };

  const handleLockAction = async (action: string) => {
    if (!user?.uid) return;
    
    if (action === "lock") {
      await writeLockState(user.uid, 1); // 1 for lock
      console.log("Locking...");
    } else if (action === "unlock") {
      await writeLockState(user.uid, 2); // 2 for unlock
      console.log("Unlocking...");
    }
  };

  const handleSearch = async () => {
    if (message.trim()) {
      setCurrentQuestion(message);
      setMessage('');
      setModalVisible(true);
      Keyboard.dismiss();

      Animated.spring(slideAnim, {
        toValue: .98,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();

      try {
        const result = await model.generateContent(message);
        const aiResponse = result.response.text();
        
        // Parse JSON response
        const jsonStart = aiResponse.indexOf('```json\n');
        const jsonEnd = aiResponse.indexOf('\n```', jsonStart);
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonPart = aiResponse.slice(jsonStart + 8, jsonEnd);
          const messagePart = aiResponse.slice(jsonEnd + 4).trim();
          
          // Parse and handle JSON
          const parsedJson = JSON.parse(jsonPart);
          console.log('Parsed JSON:', parsedJson);
          
          // Check for lock actions
          const lockIndex = parsedJson.devices_controlled.indexOf('lock');
          if (lockIndex !== -1) {
            const lockAction = parsedJson.action[lockIndex];
            await handleLockAction(lockAction);
          }
          
          setCurrentAnswer(messagePart);
          setDevicesControlled(parsedJson.devices_controlled);
        } else {
          setCurrentAnswer(aiResponse);
        }
      } catch (error) {
        setCurrentAnswer("Sorry, I'm having trouble understanding that.");
      }
    }
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setModalVisible(false);
    });
  };

  const renderDeviceControls = (devices: string[]) => {
    return (
      <View style={styles.deviceGrid}>
        {devices.includes('lock') && (
          <DeviceTile
            name="Smart Lock"
            icon="🔒"
            status="Locked"
            onPress={() => handleLockAction('unlock')}
          />
        )}
        {devices.includes('blinds') && (
          <DeviceTile
            name="Blinds"
            icon="🪟"
            status="Closed"
            onPress={() => handleLockAction('unlock')}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.userSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.welcomeText}>Welcome Home</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => auth.signOut()}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask me anything..."
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor="#9EA5B1"
        />
      </View>

      {/* Devices Section */}
      <View style={styles.devicesContainer}>
        <Text style={styles.sectionTitle}>Devices</Text>
        {renderDeviceControls(['lock', 'blinds'])}
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <BlurView
              style={styles.blur}
              blurType="dark"
              blurAmount={3}
            />
          </View>
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [800, 0]
                })
              }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={closeModal}
          >
            <Icon name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.questionText}>{currentQuestion}</Text>
          <Text style={styles.answerText}>{currentAnswer}</Text>
          {renderDeviceControls(devicesControlled)}
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#242424',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#404040',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#242424',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  searchInput: {
    backgroundColor: '#333333',
    padding: 10,
    borderRadius: 16,
    fontSize: 18,
    color: '#FFFFFF',
  },
  devicesContainer: {
    flex: 1,
    padding: 20,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#242424',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '95%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    marginLeft: 4,
  },
  questionText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 40,
    marginBottom: 20,
  },
  answerText: {
    fontSize: 32,
    color: '#CCCCCC',
    lineHeight: 48,
  },
});

export default HomeScreen;
