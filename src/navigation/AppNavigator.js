import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChatsScreen from "../screens/ChatsScreen";
import PrivateChatScreen from "../screens/PrivateChatScreen";
import VoiceCallScreen from "../screens/VoiceCallScreen";
import VideoCallScreen from "../screens/VideoCallScreen";
import StatusScreen from "../screens/StatusScreen";
import CallsScreen from "../screens/CallsScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {

  return (

    <NavigationContainer>

      <Stack.Navigator
        initialRouteName="Chats"
        screenOptions={{
          headerShown:false
        }}
      >

        <Stack.Screen
          name="Chats"
          component={ChatsScreen}
        />

        <Stack.Screen
          name="PrivateChat"
          component={PrivateChatScreen}
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
          name="Status"
          component={StatusScreen}
        />

        <Stack.Screen
          name="Calls"
          component={CallsScreen}
        />

        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>

  );

}
