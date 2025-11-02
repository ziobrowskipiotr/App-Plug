import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { MeasurementCard } from "@/src/components/MeasurementCard";
import { devicesService } from "@/src/services/devices";
import type { DeviceStats } from "@/src/types/device";

export default function DeviceDetailsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
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
      <View className="bg-gray-900 pt-12 pb-4 px-6 flex-row items-center justify-between">
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

      <ScrollView className="flex-1 px-4 pt-6">
        {loading ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400">Loading...</Text>
          </View>
        ) : stats ? (
          <>
            {/* Current Measurements Section */}
            <View className="mb-6">
              <Text className="text-gray-300 text-lg font-semibold mb-4 px-2">
                Current measurements
              </Text>

              <MeasurementCard
                icon="P"
                label="Power"
                unit="Watts"
                value={`${stats.power} W`}
              />

              <MeasurementCard
                icon="V"
                label="Voltage"
                unit="Volts"
                value={`${stats.voltage} V`}
              />

              <MeasurementCard
                icon="A"
                label="Amperage"
                unit="Ampers"
                value={`${stats.amperage} A`}
              />
            </View>

            {/* Energy Measurements Section */}
            <View className="mb-6">
              <Text className="text-gray-300 text-lg font-semibold mb-4 px-2">
                Energy measurements
              </Text>

              <MeasurementCard
                icon="T"
                label="Today"
                unit=""
                value={`${stats.today} kWh`}
              />

              <MeasurementCard
                icon="Y"
                label="Yesterday"
                unit=""
                value={`${stats.yesterday} kWh`}
              />

              <MeasurementCard
                icon="R"
                label="Total"
                unit=""
                value={`${stats.total} kWh`}
              />
            </View>
          </>
        ) : (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400">Failed to load device stats</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
