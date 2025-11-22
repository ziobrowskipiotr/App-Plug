import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devicesService } from "@/src/services/devices";
import { useToast } from "@/src/contexts/ToastContext";
import type { DeviceFormData, DeviceWithState } from "@/src/types/device";

// Query keys
export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (filters: string) => [...deviceKeys.lists(), { filters }] as const,
  details: () => [...deviceKeys.all, "detail"] as const,
  detail: (id: number) => [...deviceKeys.details(), id] as const,
  stats: (id: number) => [...deviceKeys.all, "stats", id] as const,
  today: (plugName: string) => [...deviceKeys.all, "today", plugName] as const,
  yesterday: (plugName: string) =>
    [...deviceKeys.all, "yesterday", plugName] as const,
  history: (plugName: string, from: string, to: string) =>
    [...deviceKeys.all, "history", plugName, from, to] as const,
  voltage: (plugName: string) =>
    [...deviceKeys.all, "voltage", plugName] as const,
  power: (plugName: string) => [...deviceKeys.all, "power", plugName] as const,
  current: (plugName: string) =>
    [...deviceKeys.all, "current", plugName] as const,
  state: (plugName: string) => [...deviceKeys.all, "state", plugName] as const,
  status: (plugName: string) =>
    [...deviceKeys.all, "status", plugName] as const,
};

/**
 * Hook to fetch all devices
 */
export const useDevices = () => {
  return useQuery({
    queryKey: deviceKeys.lists(),
    queryFn: () => devicesService.getDevices(),
  });
};

/**
 * Hook to fetch a single device
 */
export const useDevice = (id: number, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.detail(id),
    queryFn: () => devicesService.getDevice(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook to fetch device stats
 */
export const useDeviceStats = (id: number, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.stats(id),
    queryFn: () => devicesService.getDeviceStats(id),
    enabled: enabled && !!id,
    refetchInterval: 2000, // Refetch every 5 seconds for live updates
  });
};

/**
 * Hook to add a new device
 */
export const useAddDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeviceFormData) => devicesService.addDevice(data),
    onSuccess: () => {
      // Invalidate devices list to refetch
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
    },
  });
};

/**
 * Hook to toggle device state with Toast notifications
 */
export const useToggleDevice = () => {
  const queryClient = useQueryClient();
  const { showToast, dismissToast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      // Show pending toast (duration: 0 means it won't auto-dismiss)
      const pendingId = showToast("pending", "Toggling device...", 0);

      try {
        const result = await devicesService.toggleDevice(id);
        dismissToast(pendingId);
        return result;
      } catch (error) {
        dismissToast(pendingId);
        throw error;
      }
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: deviceKeys.lists() });
      await queryClient.cancelQueries({ queryKey: deviceKeys.detail(id) });
    },
    onSuccess: (data, id) => {
      // Update the device in cache
      queryClient.setQueryData(deviceKeys.detail(id), data);

      queryClient.setQueryData(
        deviceKeys.lists(),
        (oldData: DeviceWithState[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((device) =>
            device.id === id ? { ...device, ...data } : device
          );
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deviceKeys.stats(id) });
      showToast("success", "Device toggled successfully");
    },
    onError: (error: any, id) => {
      // Show error toast with error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to toggle device";
      showToast("error", errorMessage);
      console.error("Error toggling device:", error);
    },
  });
};

/**
 * Hook to fetch today's consumption
 */
export const useTodayConsumption = (plugName: string, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.today(plugName),
    queryFn: () => devicesService.getTodayConsumption(plugName),
    enabled: enabled && !!plugName,
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to fetch yesterday's consumption
 */
export const useYesterdayConsumption = (plugName: string, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.yesterday(plugName),
    queryFn: () => devicesService.getYesterdayConsumption(plugName),
    enabled: enabled && !!plugName,
  });
};

/**
 * Hook to fetch history consumption for a single range
 */
export const useHistoryConsumption = (
  plugName: string,
  from: string,
  to: string,
  enabled = true
) => {
  return useQuery({
    queryKey: deviceKeys.history(plugName, from, to),
    queryFn: () => devicesService.getHistory(plugName, from, to),
    enabled: enabled && !!plugName && !!from && !!to,
  });
};

/**
 * Hook to fetch history consumption for multiple time buckets
 * Used for displaying graphs with multiple data points
 */
export const useHistoryGraphData = (
  plugName: string,
  period: "1 day" | "1 week" | "1 month",
  enabled = true
) => {
  return useQuery({
    queryKey: [...deviceKeys.all, "history-graph", plugName, period],
    queryFn: async () => {
      if (!plugName) return [];

      // Generate time buckets based on period
      const buckets: { from: string; to: string; label: string }[] = [];
      const now = new Date();

      if (period === "1 day") {
        // 24 hourly buckets - from 24 hours ago to 1 hour ago (last completed hour)
        for (let i = 23; i >= 0; i--) {
          const end = new Date(now);
          end.setHours(now.getHours() - i, 59, 59, 999);
          const start = new Date(end);
          start.setHours(end.getHours() - 1, 0, 0, 0);

          // Use end hour for label (e.g., 14:00 for bucket 13:00-14:00)
          const labelHour = end.getHours();
          buckets.push({
            from: formatDateForBackend(start),
            to: formatDateForBackend(end),
            label: `${labelHour.toString().padStart(2, "0")}:00`,
          });
        }
      } else if (period === "1 week") {
        // 7 daily buckets
        for (let i = 6; i >= 0; i--) {
          const end = new Date(now);
          end.setDate(now.getDate() - i);
          end.setHours(23, 59, 59, 999);
          const start = new Date(end);
          start.setHours(0, 0, 0, 0);

          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          buckets.push({
            from: formatDateForBackend(start),
            to: formatDateForBackend(end),
            label: days[end.getDay()],
          });
        }
      } else {
        // 1 month: 30 daily buckets
        for (let i = 29; i >= 0; i--) {
          const end = new Date(now);
          end.setDate(now.getDate() - i);
          end.setHours(23, 59, 59, 999);
          const start = new Date(end);
          start.setHours(0, 0, 0, 0);

          buckets.push({
            from: formatDateForBackend(start),
            to: formatDateForBackend(end),
            label: `${end.getDate()}`,
          });
        }
      }

      // Fetch all buckets in parallel
      const results = await Promise.all(
        buckets.map(async (bucket) => {
          try {
            const response = await devicesService.getHistory(
              plugName,
              bucket.from,
              bucket.to
            );
            const consumption = parseFloat(response.consumption || "0") || 0;
            return {
              value: consumption,
              label: bucket.label,
            };
          } catch (error) {
            console.warn(
              `Failed to fetch history for ${bucket.from} - ${bucket.to}:`,
              error
            );
            return {
              value: 0,
              label: bucket.label,
            };
          }
        })
      );

      return results;
    },
    enabled: enabled && !!plugName,
    refetchInterval: period === "1 day" ? 60000 : 300000, // Refetch every minute for day, every 5 min for week/month
  });
};

/**
 * Format date to backend format: "dd-mm-yyyy HH:MM:SS"
 */
function formatDateForBackend(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Hook to fetch voltage
 */
export const useVoltage = (plugName: string, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.voltage(plugName),
    queryFn: () => devicesService.getVoltage(plugName),
    enabled: enabled && !!plugName,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to fetch power
 */
export const usePower = (plugName: string, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.power(plugName),
    queryFn: () => devicesService.getPower(plugName),
    enabled: enabled && !!plugName,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to fetch current
 */
export const useCurrent = (plugName: string, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.current(plugName),
    queryFn: () => devicesService.getCurrent(plugName),
    enabled: enabled && !!plugName,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to fetch state
 */
export const useDeviceState = (plugName: string, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.state(plugName),
    queryFn: () => devicesService.getState(plugName),
    enabled: enabled && !!plugName,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to fetch full status
 */
export const useDeviceStatus = (plugName: string, enabled = true) => {
  return useQuery({
    queryKey: deviceKeys.status(plugName),
    queryFn: () => devicesService.getStatus(plugName),
    enabled: enabled && !!plugName,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
