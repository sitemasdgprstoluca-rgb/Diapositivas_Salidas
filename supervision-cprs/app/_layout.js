import React from 'react';
import { Stack } from 'expo-router';
import { SupervisionProvider } from '../src/context/SupervisionContext';
import { COLORS } from '../src/constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SupervisionProvider>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Volver',
          animation: 'slide_from_right',
          animationDuration: 200,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            title: 'Inicio',
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="datos-generales" 
          options={{ 
            headerShown: false,
            title: 'Datos Generales',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="areas" 
          options={{ 
            headerShown: false,
            title: 'Áreas',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="vista-previa" 
          options={{ 
            headerShown: false,
            title: 'Vista Previa',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }} 
        />
      </Stack>
    </SupervisionProvider>
  );
}
