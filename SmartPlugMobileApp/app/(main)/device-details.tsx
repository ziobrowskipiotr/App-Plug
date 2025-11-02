import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { DeviceDetailsContent } from "@/src/components/DeviceDetailsContent";
import { DeviceGraphsContent } from "@/src/components/DeviceGraphsContent";
import { devicesService } from "@/src/services/devices";
import type { DeviceStats } from "@/src/types/device";

type TabType = "details" | "graphs";

export default function DeviceDetailsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState<"on" | "off">("off");

  const loadDeviceStatus = useCallback(async () => {
    try {
      if (!id) return;
      const device = await devicesService.getDevice(parseInt(id));
      setDeviceStatus(device.status);
    } catch (error) {
      console.error("Error loading device:", error);
    }
  }, [id]);

  const loadStats = useCallback(async () => {
    try {
      if (!id) return;
      const deviceStats = await devicesService.getDeviceStats(parseInt(id));
      setStats(deviceStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStats();
    loadDeviceStatus();
  }, [loadStats, loadDeviceStatus]);

  const handleToggle = async () => {
    try {
      if (!id) return;
      await devicesService.toggleDevice(parseInt(id));
      await loadDeviceStatus();
      await loadStats();
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  const toggleColor = deviceStatus === "on" ? "#10B981" : "#EF4444";

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
              name={deviceStatus === "on" ? "power" : "power-outline"}
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
        <DeviceDetailsContent stats={stats} loading={loading} />
      ) : (
        <DeviceGraphsContent deviceId={id ? parseInt(id) : 0} />
      )}
    </View>
  );
}
