import React from "react";
import { View, Text } from "react-native";

interface ChatMessageProps {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ text, isUser }) => {
  return (
    <View
      className={`flex-row mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-[#7C3AED] rounded-br-sm" : "bg-gray-800 rounded-bl-sm"
        }`}
      >
        <Text className={`text-sm ${isUser ? "text-white" : "text-gray-100"}`}>
          {text}
        </Text>
      </View>
    </View>
  );
};
