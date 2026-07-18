import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ChatsScreen from "../screens/ChatsScreen";
import ChatScreen from "../screens/ChatScreen";
import ContactsScreen from "../screens/ContactsScreen";
import PrivateChatScreen from "../screens/PrivateChatScreen";
import StatusScreen from "../screens/StatusScreen";
import CallsScreen from "../screens/CallsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SearchScreen from "../screens/SearchScreen";
import GroupsScreen from "../screens/GroupsScreen";
import GroupChatScreen from "../screens/GroupChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import VoiceCallScreen from "../screens/VoiceCallScreen";
import VideoCallScreen from "../screens/VideoCallScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {

  return (

    <Tab.Navigator>

      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
      />

      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
      />

      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
      />

      <Tab.Screen
        name="Status"
        component={StatusScreen}
      />

      <Tab.Screen
        name="Calls"
        component={CallsScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />

    </Tab.Navigator>

  );

}

export default function AppNavigator() {

  return (

    <NavigationContainer>

      <Stack.Navigator>

        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Chat"
          component={ChatScreen}
        />

        <Stack.Screen
          name="PrivateChat"
          component={PrivateChatScreen}
        />

        <Stack.Screen
          name="GroupChat"
          component={GroupChatScreen}
        />

        <Stack.Screen
          name="VoiceCall"
          component={VoiceCallScreen}
        />

        <Stack.Screen
          name="VideoCall"
          component={VideoCallScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>

  );

}


