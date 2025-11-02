import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface FloatingButtonProps {
  onPress: () => void;
  label: string;
  className?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  label,
  className = "",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`absolute bottom-6 right-6 w-14 h-14 bg-[#7C3AED] rounded-full items-center justify-center shadow-lg ${className}`.trim()}
      style={{
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Text className="text-white font-bold text-lg">{label}</Text>
    </TouchableOpacity>
  );
};
