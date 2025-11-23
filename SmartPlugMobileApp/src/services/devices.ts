import { api } from "./api";
import type {
  Device,
  DeviceWithState,
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
  GetDevicesResponse,
} from "@/src/types/device";

export const devicesService = {
  /**
   * GET /api/v1/devices/
   * Get list of all devices
   */
  async getDevices(): Promise<GetDevicesResponse> {
    try {
      const response = await api.get<GetDevicesResponse>("/api/v1/devices/");

      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        return [];
      }

      // Fetch states for all devices in parallel
      const devicesWithStates = await Promise.all(
        response.data.map(async (device, index) => {
          try {
            // Fetch state for each device
            const stateResponse = await api.get<StateResponse>(
              `/api/v1/devices/${device.name}/state`
            );

            const stateValue = stateResponse.data.state;
            // Normalize state: backend returns "ON"/"OFF", convert to lowercase
            const normalizedState =
              typeof stateValue === "string"
                ? stateValue.toLowerCase().trim()
                : String(stateValue || "")
                    .toLowerCase()
                    .trim();

            return {
              ...device,
              state: normalizedState === "on" ? "on" : "off",
            };
          } catch (error) {
            // If state fetch fails, use default state from device or "off"
            console.warn(`Failed to fetch state for ${device.name}:`, error);
            // Return device with existing state or default to "off"
            return {
              ...device,
              state: "off",
            };
          }
        })
      );

      return devicesWithStates;
    } catch (error) {
      console.error("Error fetching devices:", error);
      throw new Error("Failed to fetch devices");
    }
  },

  /**
   * Get a single device by ID
   * This requires fetching all devices and finding the one with matching ID
   */
  async getDevice(id: number): Promise<DeviceWithState> {
    const devices = await this.getDevices();
    const device = devices.find((d) => d.id === id);
    if (!device) {
      throw new Error("Device not found");
    }
    return device;
  },

  async addDevice(data: DeviceFormData): Promise<Device> {
    // TODO: Replace with actual API call when backend endpoint is available
    throw new Error("Add device endpoint not yet implemented in backend");
  },

  /**
   * PUT /api/v1/devices/<current_name>/rename
   * Rename a device
   */
  async renameDevice(id: number, newName: string): Promise<DeviceWithState> {
    try {
      // First get the device to find its current name
      const device = await this.getDevice(id);
      const currentName = device.name;

      // Call the rename endpoint
      const response = await api.put<{
        status: string;
        old_name: string;
        new_name: string;
      }>(`/api/v1/devices/${currentName}/rename`, {
        new_name: newName,
      });

      // Return updated device with new name
      return {
        ...device,
        name: response.data.new_name,
      };
    } catch (error: any) {
      console.error("Error renaming device:", error);
      throw error;
    }
  },

  /**
   * DELETE /api/v1/devices/<plug_name>/remove
   * Remove a device
   */
  async deleteDevice(id: number): Promise<void> {
    try {
      // First get the device to find its name
      const device = await this.getDevice(id);
      const plugName = device.name;

      // Call the delete endpoint
      await api.delete(`/api/v1/devices/${plugName}/remove`);
    } catch (error: any) {
      console.error("Error deleting device:", error);
      throw error;
    }
  },

  /**
   * POST /api/v1/devices/<plug_name>/toggle
   * Toggle device state (ON/OFF)
   */
  async toggleDevice(id: number): Promise<DeviceWithState> {
    try {
      // First get the device to find its name
      const device = await this.getDevice(id);
      const plugName = device.name;

      // Call the toggle endpoint
      const response = await api.post<{
        status: string;
        action: string;
        plug_name: string;
        result: string;
        new_state: string;
      }>(`/api/v1/devices/${plugName}/toggle`);

      // Return updated device with new state
      return {
        ...device,
        state: response.data.new_state.toLowerCase().trim(),
      };
    } catch (error) {
      console.error("Error toggling device:", error);
      throw error;
    }
  },

  /**
   * Get device stats by device ID
   * Fetches all stats in parallel from the energy endpoints
   */
  async getDeviceStats(id: number): Promise<DeviceStats> {
    try {
      const device = await this.getDevice(id);
      const plugName = device.name;

      // Fetch all stats in parallel from /api/v1/energy/<plug_name>/ endpoints
      const [
        voltageRes,
        powerRes,
        currentRes,
        todayRes,
        yesterdayRes,
        statusRes,
      ] = await Promise.all([
        this.getVoltage(plugName).catch((err) => {
          console.warn(`Failed to fetch voltage for ${plugName}:`, err);
          return null;
        }),
        this.getPower(plugName).catch((err) => {
          console.warn(`Failed to fetch power for ${plugName}:`, err);
          return null;
        }),
        this.getCurrent(plugName).catch((err) => {
          console.warn(`Failed to fetch current for ${plugName}:`, err);
          return null;
        }),
        this.getTodayConsumption(plugName).catch((err) => {
          console.warn(
            `Failed to fetch today consumption for ${plugName}:`,
            err
          );
          return null;
        }),
        this.getYesterdayConsumption(plugName).catch((err) => {
          console.warn(
            `Failed to fetch yesterday consumption for ${plugName}:`,
            err
          );
          return null;
        }),
        this.getStatus(plugName).catch((err) => {
          console.warn(`Failed to fetch status for ${plugName}:`, err);
          return null;
        }),
      ]);

      // Extract total from status if available
      let total = 0;
      if (statusRes) {
        // Try various possible keys for total consumption
        total = parseFloat(statusRes.energy_total) || 0;
      }

      // Parse numeric values from string responses
      return {
        power: parseFloat(powerRes!.power),
        voltage: parseFloat(voltageRes!.voltage),
        amperage: parseFloat(currentRes!.current),
        today: parseFloat(todayRes!.consumption),
        yesterday: parseFloat(yesterdayRes!.consumption),

        total: total,
      };
    } catch (error) {
      console.error("Error fetching device stats:", error);
      throw error;
    }
  },

  /**
   * GET /api/v1/energy/<plug_name>/today
   * Get today's energy consumption
   */
  async getTodayConsumption(
    plugName: string
  ): Promise<TodayConsumptionResponse> {
    const response = await api.get<TodayConsumptionResponse>(
      `/api/v1/energy/${plugName}/today`
    );
    return response.data;
  },

  /**
   * GET /api/v1/energy/<plug_name>/yesterday
   * Get yesterday's energy consumption
   */
  async getYesterdayConsumption(
    plugName: string
  ): Promise<YesterdayConsumptionResponse> {
    const response = await api.get<YesterdayConsumptionResponse>(
      `/api/v1/energy/${plugName}/yesterday`
    );
    return response.data;
  },

  /**
   * GET /api/v1/energy/<plug_name>/history?from=dd-mm-yyyy HH:MM:SS&to=dd-mm-yyyy HH:MM:SS
   * Get energy consumption over a date range
   * Backend expects dates in format: "dd-mm-yyyy HH:MM:SS" (e.g., "01-01-2024 00:00:00")
   */
  async getHistory(
    plugName: string,
    from: string,
    to: string
  ): Promise<HistoryConsumptionResponse> {
    const response = await api.get<HistoryConsumptionResponse>(
      `/api/v1/energy/${plugName}/history`,
      {
        params: { from, to },
      }
    );
    return response.data;
  },

  /**
   * GET /api/v1/energy/<plug_name>/voltage
   * Get current voltage
   */
  async getVoltage(plugName: string): Promise<VoltageResponse> {
    const response = await api.get<VoltageResponse>(
      `/api/v1/energy/${plugName}/voltage`
    );
    return response.data;
  },

  /**
   * GET /api/v1/energy/<plug_name>/power
   * Get active power (current)
   */
  async getPower(plugName: string): Promise<PowerResponse> {
    const response = await api.get<PowerResponse>(
      `/api/v1/energy/${plugName}/power`
    );
    return response.data;
  },

  /**
   * GET /api/v1/devices/<plug_name>/state
   * Get current state (ON/OFF)
   */
  async getState(plugName: string): Promise<StateResponse> {
    const response = await api.get<StateResponse>(
      `/api/v1/devices/${plugName}/state`
    );
    return response.data;
  },

  /**
   * GET /api/v1/energy/<plug_name>/current
   * Get current flowing through the plug
   */
  async getCurrent(plugName: string): Promise<CurrentResponse> {
    const response = await api.get<CurrentResponse>(
      `/api/v1/energy/${plugName}/current`
    );
    return response.data;
  },

  /**
   * GET /api/v1/energy/<plug_name>/status
   * Get full status of the plug
   */
  async getStatus(plugName: string): Promise<StatusResponse> {
    const response = await api.get<StatusResponse>(
      `/api/v1/energy/${plugName}/status`
    );
    return response.data;
  },
};
