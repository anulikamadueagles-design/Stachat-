import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ChatsScreen from "../screens/ChatsScreen";
import ContactsScreen from "../screens/ContactsScreen";
import PrivateChatScreen from "../screens/PrivateChatScreen";
import GroupsScreen from "../screens/GroupsScreen";
import GroupChatScreen from "../screens/GroupChatScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import VoiceCallScreen from "../screens/VoiceCallScreen";
import VideoCallScreen from "../screens/VideoCallScreen";
import IncomingCallScreen from "../screens/IncomingCallScreen";
import StatusScreen from "../screens/StatusScreen";
import StatusViewerScreen from "../screens/StatusViewerScreen";
import CallsScreen from "../screens/CallsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import AdvertiseWithUsScreen from "../screens/AdvertiseWithUsScreen";
import CreateAdScreen from "../screens/CreateAdScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import BackupScreen from "../screens/BackupScreen";
import ReportsScreen from "../screens/ReportsScreen";
import AboutScreen from "../screens/AboutScreen";
import MyAdsScreen from "../screens/MyAdsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Chats"
        component={ChatsScreen}
      />
      <Stack.Screen
        name="PrivateChat"
        component={PrivateChatScreen}
      />

      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
      />
      <Stack.Screen
        name="Groups"
        component={GroupsScreen}
      />
      <Stack.Screen
        name="GroupChat"
        component={GroupChatScreen}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
      />
      <Stack.Screen
        name="VoiceCall"
        component={VoiceCallScreen}
      />
      <Stack.Screen
        name="VideoCall"
        component={VideoCallScreen}
      />
      <Stack.Screen
        name="IncomingCall"
        component={IncomingCallScreen}
        options={{ presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="Status"
        component={StatusScreen}
      />
      <Stack.Screen
        name="StatusViewer"
        component={StatusViewerScreen}
      />
      <Stack.Screen
        name="Calls"
        component={CallsScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
      />
      <Stack.Screen
        name="AdvertiseWithUs"
        component={AdvertiseWithUsScreen}
      />
      <Stack.Screen
        name="CreateAd"
        component={CreateAdScreen}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
      />
      <Stack.Screen
        name="Backup"
        component={BackupScreen}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
      />
      <Stack.Screen
        name="MyAds"
        component={MyAdsScreen}
      />
    </Stack.Navigator>
  );
}
