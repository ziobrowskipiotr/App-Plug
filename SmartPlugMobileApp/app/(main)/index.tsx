import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { DeviceCard } from "@/src/components/DeviceCard";
import { FloatingButton } from "@/src/components/FloatingButton";
import { AiVoiceInputModal } from "@/src/components/AiVoiceInputModal";
import { Button } from "@/src/components/Button";
import { authService } from "@/src/services/auth";
import { useDevices, useToggleDevice } from "@/src/hooks/useDevices";
import type { Device } from "@/src/types/device";

export default function DevicesScreen() {
  const [showAiModal, setShowAiModal] = useState(false);
  const { data: devices = [], isLoading, refetch, isRefetching } = useDevices();
  const toggleDeviceMutation = useToggleDevice();

  const handleRefresh = () => {
    refetch();
  };

  const handleToggle = async (deviceId: number) => {
    try {
      await toggleDeviceMutation.mutateAsync(deviceId);
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/(auth)/login");
  };

  const handleAddDevice = () => {
    router.push("/(main)/add-device");
  };

  const handleDevicePress = (device: Device) => {
    router.push({
      pathname: "/(main)/device-details",
      params: { id: device.id.toString(), name: device.name },
    });
  };

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-gray-900 pt-12 pb-4 px-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={handleLogout} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Devices</Text>
        <TouchableOpacity onPress={handleAddDevice} className="p-2">
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Devices List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#7C3AED"
          />
        }
      >
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400">Loading devices...</Text>
          </View>
        ) : devices.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 mb-4">No devices found</Text>
            <Button
              onPress={handleAddDevice}
              title="Add Device"
              className="mt-4"
            />
          </View>
        ) : (
          devices.map((device) => (
            <TouchableOpacity
              key={device.id}
              onPress={() => handleDevicePress(device)}
              activeOpacity={0.7}
            >
              <DeviceCard
                device={device}
                onToggle={() => handleToggle(device.id)}
                onEdit={() => {
                  // Mock edit action
                  console.log("Edit device:", device.id);
                }}
                onDelete={() => {
                  // Mock delete action
                  console.log("Delete device:", device.id);
                }}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating AI Button */}
      <FloatingButton onPress={() => setShowAiModal(true)} label="AI" />

      {/* AI Voice Input Modal */}
      <AiVoiceInputModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
      />
    </View>
  );
}
