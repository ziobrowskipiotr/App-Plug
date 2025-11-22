import { api } from "./api";
import type {
  Device,
  DeviceStats,
  DeviceFormData,
  TodayConsumptionResponse,
  YesterdayConsumptionResponse,
  HistoryConsumptionResponse,
  VoltageResponse,
  PowerResponse,
  StateResponse,
  CurrentResponse,
  StatusResponse,
} from "@/src/types/device";

// Mock devices storage (in real app, this would be fetched from an API)
let mockDevices: Device[] = [
  { id: 1, name: "Socket kitchen", ip: "100.10.129.10", status: "on" },
  { id: 2, name: "Socket living room", ip: "100.10.129.11", status: "off" },
  { id: 3, name: "Socket bathroom", ip: "100.10.129.12", status: "off" },
];

let nextId = 4;

/**
 * Normalize plug name for API usage (lowercase, replace spaces with underscores)
 */
const normalizePlugName = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, "_");
};

/**
 * Get plug name from device (can be name or a normalized version)
 */
const getPlugName = (device: Device | string): string => {
  if (typeof device === "string") {
    return normalizePlugName(device);
  }
  return normalizePlugName(device.name);
};

export const devicesService = {
  async getDevices(): Promise<Device[]> {
    // TODO: Replace with actual API call to get list of devices
    // For now, return mock devices
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockDevices];
  },

  async getDevice(id: number): Promise<Device> {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 200));
    const device = mockDevices.find((d) => d.id === id);
    if (!device) {
      throw new Error("Device not found");
    }
    return device;
  },

  async addDevice(data: DeviceFormData): Promise<Device> {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newDevice: Device = {
      id: nextId++,
      name: data.name,
      ip: data.ip,
      status: "off",
    };
    mockDevices.push(newDevice);
    return newDevice;
  },

  async toggleDevice(id: number): Promise<Device> {
    // TODO: Implement toggle using state endpoint if available
    await new Promise((resolve) => setTimeout(resolve, 300));
    const device = mockDevices.find((d) => d.id === id);
    if (!device) {
      throw new Error("Device not found");
    }
    device.status = device.status === "on" ? "off" : "on";
    return device;
  },

  async getDeviceStats(id: number): Promise<DeviceStats> {
    try {
      const device = await this.getDevice(id);
      const plugName = getPlugName(device);

      // Fetch all stats in parallel
      const [
        voltageRes,
        powerRes,
        currentRes,
        todayRes,
        yesterdayRes,
        statusRes,
      ] = await Promise.all([
        this.getVoltage(plugName).catch(() => null),
        this.getPower(plugName).catch(() => null),
        this.getCurrent(plugName).catch(() => null),
        this.getTodayConsumption(plugName).catch(() => null),
        this.getYesterdayConsumption(plugName).catch(() => null),
        this.getStatus(plugName).catch(() => null),
      ]);

      // Calculate total from history if needed, or use a default
      let total = 0;
      if (statusRes) {
        // Try to extract total from status if available
        total = statusRes.total || statusRes.consumption_total || 0;
      }

      return {
        power: powerRes ? parseFloat(powerRes.power) : 0,
        voltage: voltageRes ? parseFloat(voltageRes.voltage) : 0,
        amperage: currentRes ? parseFloat(currentRes.current) : 0,
        today: todayRes ? parseFloat(todayRes.consumption) : 0,
        yesterday: yesterdayRes ? parseFloat(yesterdayRes.consumption) : 0,
        total: total,
      };
    } catch (error) {
      console.error("Error fetching device stats:", error);
      throw error;
    }
  },

  /**
   * GET /<plug_name>/today
   * Get today's energy consumption
   */
  async getTodayConsumption(
    plugName: string
  ): Promise<TodayConsumptionResponse> {
    const normalizedName = normalizePlugName(plugName);
    const response = await api.get<TodayConsumptionResponse>(
      `/${normalizedName}/today`
    );
    return response.data;
  },

  /**
   * GET /<plug_name>/yesterday
   * Get yesterday's energy consumption
   */
  async getYesterdayConsumption(
    plugName: string
  ): Promise<YesterdayConsumptionResponse> {
    const normalizedName = normalizePlugName(plugName);
    const response = await api.get<YesterdayConsumptionResponse>(
      `/${normalizedName}/yesterday`
    );
    return response.data;
  },

  /**
   * GET /<plug_name>/history?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Get energy consumption over a date range
   */
  async getHistory(
    plugName: string,
    from: string,
    to: string
  ): Promise<HistoryConsumptionResponse> {
    const normalizedName = normalizePlugName(plugName);
    const response = await api.get<HistoryConsumptionResponse>(
      `/${normalizedName}/history`,
      {
        params: { from, to },
      }
    );
    return response.data;
  },

  /**
   * GET /<plug_name>/voltage
   * Get current voltage
   */
  async getVoltage(plugName: string): Promise<VoltageResponse> {
    const normalizedName = normalizePlugName(plugName);
    const response = await api.get<VoltageResponse>(
      `/${normalizedName}/voltage`
    );
    return response.data;
  },

  /**
   * GET /<plug_name>/power
   * Get active power (current)
   */
  async getPower(plugName: string): Promise<PowerResponse> {
    const normalizedName = normalizePlugName(plugName);
    const response = await api.get<PowerResponse>(`/${normalizedName}/power`);
    return response.data;
  },

  /**
   * GET /<plug_name>/state
   * Get current state (ON/OFF)
   */
  async getState(plugName: string): Promise<StateResponse> {
    const normalizedName = normalizePlugName(plugName);
    const response = await api.get<StateResponse>(`/${normalizedName}/state`);
    return response.data;
  },

  /**
   * GET /<plug_name>/current
   * Get current flowing through the plug
   */
  async getCurrent(plugName: string): Promise<CurrentResponse> {
    const normalizedName = normalizePlugName(plugName);
    const response = await api.get<CurrentResponse>(
      `/${normalizedName}/current`
    );
    return response.data;
  },

  /**
   * GET /<plug_name>/status
   * Get full status of the plug
   */
  async getStatus(plugName: string): Promise<StatusResponse> {
    const normalizedName = normalizePlugName(plugName);
    const response = await api.get<StatusResponse>(`/${normalizedName}/status`);
    return response.data;
  },
};
