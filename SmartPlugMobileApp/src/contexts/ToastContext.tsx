import React, { createContext, useContext, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Toast, type ToastConfig } from "@/src/components/Toast";

interface ToastContextType {
  showToast: (
    type: ToastConfig["type"],
    message: string,
    duration?: number
  ) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = useCallback(
    (type: ToastConfig["type"], message: string, duration?: number): string => {
      const id = Date.now().toString() + Math.random().toString(36);
      const newToast: ToastConfig = {
        id,
        type,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "flex-start",
  },
});
