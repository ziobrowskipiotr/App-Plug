import React from "react";
import { View, Text, ScrollView } from "react-native";
import { MeasurementCard } from "@/src/components/MeasurementCard";
import type { DeviceStats } from "@/src/types/device";

interface DeviceDetailsContentProps {
  stats: DeviceStats | undefined;
  loading: boolean;
}

export const DeviceDetailsContent: React.FC<DeviceDetailsContentProps> = ({
  stats,
  loading,
}) => {
  if (loading || !stats) {
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4 pt-6">
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
    </ScrollView>
  );
};
