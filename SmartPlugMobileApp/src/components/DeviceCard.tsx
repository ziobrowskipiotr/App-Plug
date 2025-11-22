import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Device } from "@/src/types/device";

interface DeviceCardProps {
  device: Device;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const isOn = device.status === "on";
  const toggleColor = isOn ? "#10B981" : "#EF4444";

  return (
    <View className="bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center">
      {/* Icon */}
      <View className="mr-4">
        <Ionicons name="flash-outline" size={32} color="#9CA3AF" />
      </View>

      {/* Device Info */}
      <View className="flex-1">
        <Text className="text-white text-lg font-semibold mb-1">
          {device.name}
        </Text>
        <Text className="text-gray-400 text-sm">{device.ip}</Text>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-3">
        {/* Edit Button */}
        {onEdit && (
          <TouchableOpacity onPress={onEdit} className="p-2">
            <Ionicons name="pencil-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Delete Button */}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Toggle Button */}
        <TouchableOpacity onPress={onToggle} className="p-2">
          <Ionicons
            name={isOn ? "power" : "power-outline"}
            size={24}
            color={toggleColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
