import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useSpeechRecognition } from "@/src/hooks/useSpeechRecognition";
import { ChatMessage } from "@/src/components/ChatMessage";
import { useMcp } from "@/src/hooks/useMcp";

interface AiVoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ChatMessageData {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const AiVoiceInputModal: React.FC<AiVoiceInputModalProps> = ({
  visible,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // MCP hook for AI chat interactions
  const { sendMessage: sendMcpMessage, isLoading: isMcpLoading } = useMcp({
    onError: (error) => {
      console.error("MCP error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to communicate with AI assistant."
      );
    },
  });

  // Speech recognition hook for live transcription
  const { startListening, stopListening, abort } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: (transcriptText) => {
      // Update input text with live transcription
      setInputText(transcriptText);
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      Alert.alert("Error", "Speech recognition failed. Please try again.");
      setIsRecording(false);
      stopListening();
    },
  });

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === "granted";
      setHasPermission(granted);
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Microphone permission is required to record audio."
        );
      }
      return granted;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setHasPermission(false);
      return false;
    }
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  useEffect(() => {
    if (!visible) {
      setInputText("");
      setIsRecording(false);
      abort();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
        recordingRef.current = null;
      }
    }
  }, [visible, abort]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const startRecording = async () => {
    let permissionGranted = hasPermission;
    if (!permissionGranted) {
      permissionGranted = await requestPermissions();
      if (!permissionGranted) return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);

      startListening();
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);

      stopListening();

      await recordingRef.current.stopAndUnloadAsync();

      const uri = recordingRef.current.getURI();
      if (uri) {
        console.log("Recording completed:", uri);
      }

      recordingRef.current = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording.");
      setIsRecording(false);
      abort();
    }
  };

  const handleMicrophonePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSend = async () => {
    const messageText = inputText.trim();
    if (!messageText) return;

    const userMessage: ChatMessageData = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const aiResponse = await sendMcpMessage(messageText);

      if (aiResponse) {
        const aiMessage: ChatMessageData = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Error already handled by useMcp hook's onError callback
        // Optionally add an error message to chat
        const errorMessage: ChatMessageData = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn't process your request. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Error already handled by useMcp hook's onError callback
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-[#121212] mt-12 rounded-t-3xl">
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
              <Text className="text-white text-xl font-bold">AI Assistant</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4 pt-4"
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                  <Ionicons
                    name="chatbubbles-outline"
                    size={64}
                    color="#6B7280"
                  />
                  <Text className="text-gray-400 text-base mt-4 text-center">
                    Start a conversation with AI assistant
                  </Text>
                  <Text className="text-gray-500 text-sm mt-2 text-center">
                    Type your message
                  </Text>
                </View>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    text={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))
              )}
            </ScrollView>
            <View className="border-t border-gray-800 px-4 py-3 bg-[#121212] mb-8">
              <View className="flex-row items-end gap-2">
                <View className="flex-1 bg-gray-800 rounded-2xl px-4 py-3 min-h-[88px] max-h-120">
                  <TextInput
                    ref={inputRef}
                    className="text-white text-base flex-1"
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    editable={true}
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      padding: 0,
                    }}
                  />
                  {isRecording && (
                    <View className="flex-row items-center mt-2">
                      <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                      <Text className="text-red-400 text-xs">Recording...</Text>
                    </View>
                  )}
                  {isMcpLoading && (
                    <View className="flex-row items-center mt-2">
                      <ActivityIndicator
                        size="small"
                        color="#60A5FA"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-blue-400 text-xs">
                        AI is thinking...
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-col gap-2">
                  <TouchableOpacity
                    onPress={handleMicrophonePress}
                    disabled={isMcpLoading}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      isRecording
                        ? "bg-red-500"
                        : isMcpLoading
                        ? "bg-gray-600 opacity-50"
                        : "bg-[#7C3AED]"
                    }`}
                  >
                    <Ionicons
                      name={isRecording ? "stop" : "mic"}
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  {inputText.trim() ? (
                    <TouchableOpacity
                      onPress={handleSend}
                      disabled={isMcpLoading || isRecording}
                      className={`w-12 h-12 rounded-full items-center justify-center ${
                        isMcpLoading || isRecording
                          ? "bg-gray-600 opacity-50"
                          : "bg-[#7C3AED]"
                      }`}
                    >
                      {isMcpLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View className="w-12 h-12 rounded-full items-center justify-center bg-gray-600 opacity-50">
                      <Ionicons name="send" size={20} color="#9CA3AF" />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
