import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { DeviceCard } from "@/src/components/DeviceCard";
import { FloatingButton } from "@/src/components/FloatingButton";
import { AiVoiceInputModal } from "@/src/components/AiVoiceInputModal";
import { Button } from "@/src/components/Button";
import { authService } from "@/src/services/auth";
import {
  useDevices,
  useToggleDevice,
  useRenameDevice,
  useDeleteDevice,
} from "@/src/hooks/useDevices";
import type { DeviceWithState } from "@/src/types/device";

export default function DevicesScreen() {
  const [showAiModal, setShowAiModal] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [deviceToRename, setDeviceToRename] = useState<DeviceWithState | null>(
    null
  );
  const [newDeviceName, setNewDeviceName] = useState("");

  const { data: devices = [], isLoading, refetch, isRefetching } = useDevices();
  console.log(devices);
  const { mutateAsync: toggleDevice } = useToggleDevice();
  const { mutateAsync: renameDevice } = useRenameDevice();
  const { mutateAsync: deleteDevice } = useDeleteDevice();

  const handleRefresh = () => {
    refetch();
  };

  const handleToggle = async (deviceId: number) => {
    try {
      await toggleDevice(deviceId);
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  const handleEdit = (device: DeviceWithState) => {
    setDeviceToRename(device);
    setNewDeviceName(device.name);
    setRenameModalVisible(true);
  };

  const handleRename = async () => {
    if (!deviceToRename || !newDeviceName.trim()) {
      Alert.alert("Error", "Device name cannot be empty");
      return;
    }

    if (newDeviceName.trim() === deviceToRename.name) {
      setRenameModalVisible(false);
      setDeviceToRename(null);
      setNewDeviceName("");
      return;
    }

    try {
      setRenameModalVisible(false);
      await renameDevice({
        id: deviceToRename.id,
        newName: newDeviceName.trim(),
      });
      setDeviceToRename(null);
      setNewDeviceName("");
    } catch (error) {
      // Error is handled by the hook's toast notification
    }
  };

  const handleDelete = (device: DeviceWithState) => {
    Alert.alert(
      "Delete Device",
      `Are you sure you want to delete "${device.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDevice(device.id);
            } catch (error) {
              // Error is handled by the hook's toast notification
              console.error("Error deleting device:", error);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/(auth)/login");
  };

  const handleAddDevice = () => {
    router.push("/(main)/add-device");
  };

  const handleDevicePress = (device: DeviceWithState) => {
    router.push({
      pathname: "/(main)/device-details",
      params: {
        id: device.id.toString(),
        name: device.name,
        state: device.state,
      },
    });
  };

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-gray-900 pt-12 pb-4 px-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={handleLogout} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Devices</Text>
      </View>

      {/* Devices List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 96,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#7C3AED"
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400">Loading devices...</Text>
          </View>
        ) : devices.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 mb-4">No devices found</Text>
            <Button
              onPress={handleAddDevice}
              title="Add Device"
              className="mt-4"
            />
          </View>
        ) : (
          <>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                onPress={() => handleDevicePress(device)}
                activeOpacity={0.7}
              >
                <DeviceCard
                  device={device}
                  onToggle={() => handleToggle(device.id)}
                  onEdit={() => handleEdit(device)}
                  onDelete={() => handleDelete(device)}
                />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Swipe to refresh hint na dole */}
        <View className="mt-6 items-center justify-center opacity-60">
          <Ionicons
            name="arrow-down-circle-outline"
            size={25}
            color="#9CA3AF"
          />
          <Text className="text-gray-400 text-s mt-1">
            Swipe down to refresh
          </Text>
        </View>
      </ScrollView>

      {/* Floating AI Button */}
      <FloatingButton onPress={() => setShowAiModal(true)} label="AI" />

      {/* AI Voice Input Modal */}
      <AiVoiceInputModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
      />

      {/* Rename Device Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRenameModalVisible(false);
          setDeviceToRename(null);
          setNewDeviceName("");
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-white text-xl font-bold mb-4">
              Rename Device
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              Enter a new name for {deviceToRename?.name}
            </Text>
            <TextInput
              className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-4"
              placeholder="Device name"
              placeholderTextColor="#9CA3AF"
              value={newDeviceName}
              onChangeText={setNewDeviceName}
              autoFocus
              onSubmitEditing={handleRename}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-700 py-3 rounded-lg items-center"
                onPress={() => {
                  setRenameModalVisible(false);
                  setDeviceToRename(null);
                  setNewDeviceName("");
                }}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-[#7C3AED] py-3 rounded-lg items-center"
                onPress={handleRename}
              >
                <Text className="text-white font-semibold">Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
