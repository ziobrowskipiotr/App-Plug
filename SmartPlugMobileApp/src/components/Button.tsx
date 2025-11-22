import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}) => {
  const baseClasses = "px-6 py-4 rounded-2xl items-center justify-center";
  const variantClasses = variant === "primary" ? "bg-[#7C3AED]" : "bg-gray-600";

  const textClasses = variant === "primary" ? "text-white" : "text-gray-200";
  const opacityClass = disabled || loading ? "opacity-50" : "";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${opacityClass} ${className}`.trim()}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#E5E7EB"}
        />
      ) : (
        <Text className={`font-semibold text-base ${textClasses}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
