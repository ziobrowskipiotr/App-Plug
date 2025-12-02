import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { storage } from "@/src/utils/storage";
import { ToastProvider } from "@/src/contexts/ToastContext";
import "../global.css";
import { StatusBar } from "expo-status-bar";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await storage.getToken();
        const inAuthGroup = segments[0] === "(auth)";

        if (!token && !inAuthGroup) {
          router.replace("/(auth)/login");
        } else if (token && inAuthGroup) {
          router.replace("/(main)");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setReady(true);
      }
    };

    checkAuth();
  }, [segments, router]);

  if (!ready) {
    return (
      <>
        <View style={{ flex: 1, backgroundColor: "#121212" }} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <Slot />
      <StatusBar style="light" />
      </ToastProvider>
    </QueryClientProvider>
  );
}
