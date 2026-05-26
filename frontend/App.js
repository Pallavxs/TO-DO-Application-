// ─────────────────────────────────────────────────────────────────
// App.js — Navigation Entry Point
//
// BEGINNER EXPLANATION:
// This file is the ROOT of our application. Its only job is to
// set up the navigation system. All actual UI lives in the
// /screens/ folder.
//
// Think of this like a "Table of Contents" for your app:
//   Screen 1 → HomeScreen  (the main todo list)
//   Screen 2 → AddTodo     (the form to add a new task)
//
// React Navigation handles moving between screens like a stack
// of cards: pushing a new card on top, popping it off to go back.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Our two screens
import HomeScreen    from './screens/HomeScreen';
import AddTodoScreen from './screens/AddTodoScreen';

// createNativeStackNavigator() gives us two components:
//   Stack.Navigator — the container that manages the screen stack
//   Stack.Screen    — registers a single screen in the stack
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // SafeAreaProvider ensures content doesn't overlap the phone's notch or home bar
    <SafeAreaProvider>
      {/*
        NavigationContainer wraps everything.
        It manages the navigation state and links the stack to the OS back button.
      */}
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"   // which screen to show first
          screenOptions={{
            headerShown: false,     // we draw our own custom headers in each screen
          }}
        >
          {/* Screen name "Home" maps to HomeScreen component */}
          <Stack.Screen name="Home"    component={HomeScreen}    />

          {/* Screen name "AddTodo" maps to AddTodoScreen component */}
          <Stack.Screen name="AddTodo" component={AddTodoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
