import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { authService } from "@/src/services/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.login({ username, password });
      router.replace("/(main)");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#121212]"
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          {/* Logo Section */}
          <View className="items-center mb-12">
            <View className="mb-6">
              {/* Tailscale-like logo placeholder */}
              <View className="flex-row gap-2 mb-2">
                <View className="w-3 h-3 bg-white rounded-full" />
                <View className="w-3 h-3 bg-white rounded-full" />
                <View className="w-3 h-3 bg-white rounded-full" />
              </View>
              <View className="flex-row gap-2 mb-2">
                <View className="w-3 h-3 bg-white rounded-full" />
                <View className="w-3 h-3 bg-white rounded-full" />
                <View className="w-3 h-3 bg-white rounded-full" />
              </View>
              <View className="flex-row gap-2">
                <View className="w-3 h-3 bg-white rounded-full" />
                <View className="w-3 h-3 bg-white rounded-full" />
                <View className="w-3 h-3 bg-white rounded-full" />
              </View>
            </View>
            <Text className="text-white text-2xl font-bold mb-2">
              tailscale
            </Text>
            <Text className="text-gray-400 text-lg">Sign in to Smart Plug</Text>
          </View>

          {/* Form */}
          <View>
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />

            {error ? (
              <Text className="text-red-400 text-sm mb-4 text-center">
                {error}
              </Text>
            ) : null}

            <Button
              onPress={handleLogin}
              title="Sign in"
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
