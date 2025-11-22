import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devicesService } from "@/src/services/devices";
import type { DeviceFormData } from "@/src/types/device";

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
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
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
 * Hook to toggle device state
 */
export const useToggleDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => devicesService.toggleDevice(id),
    onSuccess: (data, id) => {
      // Update the device in cache
      queryClient.setQueryData(deviceKeys.detail(id), data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deviceKeys.stats(id) });
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
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
 * Hook to fetch history consumption
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
