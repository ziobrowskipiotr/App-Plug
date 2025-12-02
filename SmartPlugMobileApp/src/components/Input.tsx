import React from "react";
import { TextInput, Text, View } from "react-native";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  className = "",
}) => {
  return (
    <View className={`mb-4 ${className}`.trim()}>
      {label && (
        <Text className="text-gray-300 text-sm mb-2 font-medium">{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        className="bg-gray-800 text-white rounded-2xl px-4 py-4 text-base border border-gray-700"
        style={{ color: "#FFFFFF" }}
      />
    </View>
  );
};
