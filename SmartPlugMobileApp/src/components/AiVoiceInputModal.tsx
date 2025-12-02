import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

interface AiVoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
}

type RecordingStatus = "idle" | "recording" | "stopped" | "processing";

export const AiVoiceInputModal: React.FC<AiVoiceInputModalProps> = ({
  visible,
  onClose,
}) => {
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("idle");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // Request permissions on mount
    requestPermissions();

    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  React.useEffect(() => {
    // Reset when modal closes
    if (!visible) {
      setRecordingStatus("idle");
      setRecordingDuration(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [visible]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === "granted");
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Microphone permission is required to record audio."
        );
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await requestPermissions();
      if (!hasPermission) return;
    }

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create a new recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setRecordingStatus("recording");
      setRecordingDuration(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
      setRecordingStatus("idle");
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setRecordingStatus("processing");

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();

      // Get recording info (optional - just for logging)
      const uri = recordingRef.current.getURI();
      if (uri) {
        console.log("Recording completed:", uri);
      }

      recordingRef.current = null;

      // Show success state briefly before closing
      setRecordingStatus("stopped");

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Auto-close after showing success message for 2 seconds
      setTimeout(() => {
        setRecordingStatus("idle");
        setRecordingDuration(0);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording.");
      setRecordingStatus("idle");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMicrophonePress = () => {
    if (recordingStatus === "idle") {
      startRecording();
    } else if (recordingStatus === "recording") {
      stopRecording();
    }
  };

  const getMicrophoneIcon = () => {
    switch (recordingStatus) {
      case "recording":
        return "mic";
      case "processing":
        return "hourglass";
      default:
        return "mic-outline";
    }
  };

  const getMicrophoneColor = () => {
    switch (recordingStatus) {
      case "recording":
        return "#EF4444"; // Red
      case "processing":
        return "#9CA3AF"; // Gray
      default:
        return "#7C3AED"; // Purple
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#121212] rounded-t-3xl p-6 pb-12">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-xl font-bold">AI Voice Input</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="items-center mb-8">
            {/* Microphone Button */}
            <TouchableOpacity
              onPress={handleMicrophonePress}
              disabled={recordingStatus === "processing" || !hasPermission}
              className={`w-24 h-24 rounded-full items-center justify-center ${
                recordingStatus === "processing" ? "opacity-50" : ""
              }`}
              style={{
                backgroundColor:
                  recordingStatus === "recording"
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(124, 58, 237, 0.2)",
              }}
            >
              {recordingStatus === "processing" ? (
                <ActivityIndicator size="large" color="#9CA3AF" />
              ) : (
                <Ionicons
                  name={getMicrophoneIcon()}
                  size={48}
                  color={getMicrophoneColor()}
                />
              )}
            </TouchableOpacity>

            {/* Status Text */}
            <Text className="text-white text-lg font-semibold mt-6 mb-2">
              {recordingStatus === "idle" && "Tap to start recording"}
              {recordingStatus === "recording" && "Recording..."}
              {recordingStatus === "processing" && "Processing..."}
              {recordingStatus === "stopped" && "Audio recorded successfully!"}
            </Text>

            {/* Success Icon */}
            {recordingStatus === "stopped" && (
              <View className="mt-4">
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
            )}

            {/* Duration */}
            {(recordingStatus === "recording" ||
              recordingStatus === "stopped") && (
              <Text className="text-gray-400 text-base mt-2">
                Duration: {formatDuration(recordingDuration)}
              </Text>
            )}

            {/* Permission Message */}
            {hasPermission === false && (
              <Text className="text-red-400 text-sm mt-4 text-center">
                Microphone permission is required to record audio.
              </Text>
            )}
          </View>

          {/* Instructions */}
          <View className="bg-gray-800 rounded-2xl p-4">
            <Text className="text-gray-300 text-sm">
              {recordingStatus === "idle" &&
                "Press the microphone icon to start recording your voice command."}
              {recordingStatus === "recording" &&
                "Press the microphone icon again to stop recording."}
              {recordingStatus === "processing" &&
                "Processing your recording..."}
              {recordingStatus === "stopped" &&
                "Your audio has been recorded successfully!"}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
