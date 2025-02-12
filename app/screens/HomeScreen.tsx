import React, { useState, useRef } from 'react';
import { View, Text, Button, TextInput, ScrollView, StyleSheet, Animated, Keyboard, TouchableOpacity } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { auth } from '../components/firebaseConfig';

const HomeScreen = () => {
  const { user, setUser } = useAuth();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ text: string; sender: string }[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Logout failed:', error.message);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { text: message, sender: 'user' }]);
      setMessage('');
      Keyboard.dismiss();
      
      if (!isExpanded) {
        setIsExpanded(true);
        Animated.spring(animatedHeight, {
          toValue: 1,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start();
      }
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.spring(animatedHeight, {
      toValue: isExpanded ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.displayName || user?.email}!</Text>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {/* Chat Interface */}
      <Animated.View 
        style={[
          styles.chatContainer,
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: ['9%', '70%']
            }),
            marginTop: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: ['35%', '5%']
            })
          }
        ]}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.chatTitle}>Chat</Text>
          <TouchableOpacity 
            onPress={handleToggleExpand}
            style={styles.expandButton}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? '▼' : '▲'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isExpanded && (
          <ScrollView style={styles.chatHistory}>
            {chatHistory.map((msg, index) => (
              <View key={index} style={styles.messageContainer}>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Ask me anything..."
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={true}
            returnKeyType="send"
            placeholderTextColor="#9EA5B1"
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  chatHistory: {
    flex: 1,
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  messageContainer: {
    backgroundColor: '#6C5CE7',
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 5,
    marginBottom: 12,
    maxWidth: '80%',
    alignSelf: 'flex-end',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#F0F2F5',
    fontSize: 16,
    color: '#2C3E50',
  },
  sendButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  expandButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
