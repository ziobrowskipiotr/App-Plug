import React from "react";
import { View, Text } from "react-native";

interface MeasurementCardProps {
  icon: string;
  label: string;
  unit: string;
  value: number | string;
}

export const MeasurementCard: React.FC<MeasurementCardProps> = ({
  icon,
  label,
  unit,
  value,
}) => {
  return (
    <View className="bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center">
      {/* Icon Circle */}
      <View className="w-12 h-12 bg-[#7C3AED] rounded-full items-center justify-center mr-4">
        <Text className="text-white font-bold text-lg">{icon}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-gray-400 text-xs mb-1">{unit}</Text>
        <Text className="text-white text-base font-medium">{label}</Text>
      </View>

      {/* Value */}
      <View className="items-end">
        <Text className="text-white text-xl font-bold">{value}</Text>
      </View>
    </View>
  );
};
