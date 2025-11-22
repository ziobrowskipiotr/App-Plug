import React, { useEffect, useRef, useCallback } from "react";
import { Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ToastType = "pending" | "success" | "error";

export interface ToastConfig {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastConfig;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  }, [fadeAnim, slideAnim, onDismiss, toast.id]);

  useEffect(() => {
    // Slide in from left animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
    ]).start();

    // Auto dismiss after duration (or default)
    const duration = toast.duration || (toast.type === "pending" ? 0 : 3000);
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [fadeAnim, slideAnim, handleDismiss, toast.duration, toast.type]);

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          backgroundColor: "#10B981",
          icon: "checkmark-circle" as const,
        };
      case "error":
        return {
          backgroundColor: "#EF4444",
          icon: "close-circle" as const,
        };
      case "pending":
        return {
          backgroundColor: "#7C3AED",
          icon: "hourglass" as const,
        };
      default:
        return {
          backgroundColor: "#6B7280",
          icon: "information-circle" as const,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <Animated.View
      style={[
        toastStyles.container,
        {
          backgroundColor: styles.backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }], // Slide horizontally (left to right)
        },
      ]}
    >
      <Ionicons name={styles.icon} size={24} color="#FFFFFF" />
      <Text style={toastStyles.message}>{toast.message}</Text>
      {toast.type !== "pending" && (
        <TouchableOpacity
          onPress={handleDismiss}
          style={toastStyles.closeButton}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const toastStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 12,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});
