import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { useAddDevice } from "@/src/hooks/useDevices";

export default function AddDeviceScreen() {
  const [deviceName, setDeviceName] = useState("");
  const [deviceIP, setDeviceIP] = useState("");
  const [error, setError] = useState("");
  const addDeviceMutation = useAddDevice();

  const handleAdd = async () => {
    if (!deviceName.trim() || !deviceIP.trim()) {
      setError("Please fill in all fields");
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(deviceIP)) {
      setError("Please enter a valid IP address");
      return;
    }

    setError("");

    try {
      await addDeviceMutation.mutateAsync({
        name: deviceName,
        ip: deviceIP,
      });
      router.back();
    } catch (err) {
      setError("Failed to add device. Please try again.");
      console.error("Add device error:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#121212]"
    >
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-gray-900 pt-12 pb-4 px-6 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-4">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">
          Add device to your account
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Socket Icon */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center">
            <Ionicons name="flash-outline" size={48} color="#121212" />
          </View>
        </View>

        {/* Form */}
        <Input
          label="Device name"
          value={deviceName}
          onChangeText={setDeviceName}
          placeholder="Enter device name"
        />

        <Input
          label="Device IP"
          value={deviceIP}
          onChangeText={setDeviceIP}
          placeholder="Enter device IP address"
          keyboardType="default"
        />

        {error ? (
          <Text className="text-red-400 text-sm mb-4 text-center">{error}</Text>
        ) : null}

        <Button
          onPress={handleAdd}
          title="Add"
          loading={addDeviceMutation.isPending}
          disabled={addDeviceMutation.isPending}
          className="mt-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
