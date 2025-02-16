#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include "time.h"
// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"
#include "secrets.h"

// Define Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Variable to save USER UID
String uid;

// Database main path (to be updated in setup with the user UID)
String databasePath;
// Database child nodes
String motor_direction_path = "/motor_direction";
String motor_speed_path = "/motor_speed";
String state_path = "/state";
String device_path = "/lock-surya-apt";

// Parent Node (to be updated in every loop)
String parentPath;

int timestamp;
FirebaseJson json;

// Timer variables (send new readings every three minutes)
unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 100;

// Initialize WiFi
void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

// Check wifi and firebase connections and reconnect if necessary
void checkConnections() {
  Serial.println("Checking connections...");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reconnecting WiFi...");
    WiFi.disconnect();
    WiFi.reconnect();
  } else {
    Serial.println("Wifi Connected");
  }
  if (!Firebase.ready()) {
    Serial.println("Reconnecting Firebase...");
    Firebase.reconnectWiFi(true);
  } else {
    Serial.println("Firebase connected");
  }
}

// Move specific motor at speed and direction
void move(int speed, int direction, int pinAIN1, int pinAIN2, int pinPWMA) {
  boolean inPin1 = LOW;
  boolean inPin2 = HIGH;

  if(direction == 1){
    inPin1 = HIGH;
    inPin2 = LOW;
  }

  digitalWrite(pinAIN1, inPin1);
  digitalWrite(pinAIN2, inPin2);
  analogWrite(pinPWMA, speed);
}

// Function that gets current epoch time
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    //Serial.println("Failed to obtain time");
    return(0);
  }
  time(&now);
  return now;
}

void setup(){
  Serial.begin(115200);
  initWiFi();

  // Assign the api key (required)
  config.api_key = API_KEY;

  // Assign the user sign in credentials
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Assign the RTDB URL (required)
  config.database_url = DATABASE_URL;

  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);

  // Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

  // Assign the maximum retry of token generation
  config.max_token_generation_retry = 5;

  // Initialize the library with the Firebase authen and config
  Firebase.begin(&config, &auth);

  // Getting the user UID might take a few seconds
  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
    Serial.print('.');
    delay(1000);
  }
  // Print user UID
  uid = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(uid);

  // Update database path
  databasePath = "/UsersData/" + uid;

  pinMode(PWMA, OUTPUT);
  pinMode(AIN1, OUTPUT);
  pinMode(AIN2, OUTPUT);

}

unsigned long lastCheckTime = 0;  // Track last execution time
const unsigned long checkInterval = .1 * 60 * 1000;  // 10 minutes in milliseconds

void loop(){
  String motorSpeedPath = databasePath + device_path + motor_speed_path;
  String motorDirectionPath = databasePath + device_path + motor_direction_path;
  String motorStatePath = databasePath + device_path + state_path;

  Firebase.RTDB.getInt(&fbdo, motorStatePath.c_str());
  int motorState = fbdo.to<int>();

  if (motorState == 1) { //lock the door
    Serial.println ("motorState = 1");
    Firebase.RTDB.setInt(&fbdo, motorDirectionPath.c_str(), 1);
    Firebase.RTDB.setInt(&fbdo, motorSpeedPath.c_str(), 255);
    move(255, 1, AIN1, AIN2, PWMA);
    delay(1200);
    move(0, 1, AIN1, AIN2, PWMA);
    Firebase.RTDB.setInt(&fbdo, motorDirectionPath.c_str(), 0);
    Firebase.RTDB.setInt(&fbdo, motorSpeedPath.c_str(), 0);
    Firebase.RTDB.setInt(&fbdo, motorStatePath.c_str(), 0);
  } else if (motorState == 2) { //unlock the door
    Serial.println ("motorState = 2");
    Firebase.RTDB.setInt(&fbdo, motorDirectionPath.c_str(), 0);
    Firebase.RTDB.setInt(&fbdo, motorSpeedPath.c_str(), 255);
    move(255, 0, AIN1, AIN2, PWMA);
    delay(1200);
    move(0, 0, AIN1, AIN2, PWMA);
    Firebase.RTDB.setInt(&fbdo, motorDirectionPath.c_str(), 0);
    Firebase.RTDB.setInt(&fbdo, motorSpeedPath.c_str(), 0);
    Firebase.RTDB.setInt(&fbdo, motorStatePath.c_str(), 0);
  }

  if (millis() - lastCheckTime >= checkInterval) {
    Serial.println("Checking WiFi and Firebase connections...");
    checkConnections();
    lastCheckTime = millis();  // Reset timer
  }
  delay(250);
}