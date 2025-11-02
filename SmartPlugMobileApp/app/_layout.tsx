import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { storage } from '@/src/utils/storage';
import '../global.css';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await storage.getToken();
        const inAuthGroup = segments[0] === '(auth)';

        if (!token && !inAuthGroup) {
          router.replace('/(auth)/login');
        } else if (token && inAuthGroup) {
          router.replace('/(main)');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setReady(true);
      }
    };

    checkAuth();
  }, [segments]);

  if (!ready) {
    return (
      <>
        <View style={{ flex: 1, backgroundColor: '#121212' }} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <Slot />
      <StatusBar style="light" />
    </>
  );
}
