import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { DeviceDetailsContent } from "@/src/components/DeviceDetailsContent";
import { DeviceGraphsContent } from "@/src/components/DeviceGraphsContent";
import {
  useDevice,
  useDeviceStats,
  useToggleDevice,
} from "@/src/hooks/useDevices";

type TabType = "details" | "graphs";

export default function DeviceDetailsScreen() {
  const { id, name, state } = useLocalSearchParams<{
    id: string;
    name: string;
    state: string;
  }>();
  const [activeTab, setActiveTab] = useState<TabType>("details");

  const deviceId = id ? parseInt(id) : 0;
  const { data: device, isLoading: deviceLoading } = useDevice(deviceId, !!id);
  const { data: stats, isLoading: statsLoading } = useDeviceStats(
    deviceId,
    !!id && !!device
  );
  const toggleDeviceMutation = useToggleDevice();

  // Normalize state to lowercase for consistent comparison
  const deviceState = device?.state?.toLowerCase().trim() || state;
  const isDeviceOn = deviceState === "on";

  const handleToggle = async () => {
    if (!id) return;
    try {
      await toggleDeviceMutation.mutateAsync(deviceId);
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  const toggleColor = isDeviceOn ? "#10B981" : "#EF4444";

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-gray-900 pt-12 pb-4 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            {name || "Device Details"}
          </Text>
          <TouchableOpacity onPress={handleToggle} className="p-2">
            <Ionicons
              name={isDeviceOn ? "power" : "power-outline"}
              size={24}
              color={toggleColor}
            />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab("details")}
            className={`flex-1 py-3 px-4 rounded-lg items-center ${
              activeTab === "details"
                ? "bg-[#7C3AED]"
                : "bg-gray-800 border border-gray-700"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "details" ? "text-white" : "text-gray-400"
              }`}
            >
              Socket Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("graphs")}
            className={`flex-1 py-3 px-4 rounded-lg items-center ${
              activeTab === "graphs"
                ? "bg-[#7C3AED]"
                : "bg-gray-800 border border-gray-700"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "graphs" ? "text-white" : "text-gray-400"
              }`}
            >
              Graphs
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === "details" ? (
        <DeviceDetailsContent stats={stats} loading={statsLoading} />
      ) : (
        <DeviceGraphsContent deviceId={deviceId} deviceName={name} />
      )}
    </View>
  );
}
