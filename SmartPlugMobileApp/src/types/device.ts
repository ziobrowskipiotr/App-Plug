export interface Device {
  id: number;
  name: string;
  ipv4: string;
  mac: string;
}

export interface DeviceWithState extends Device {
  state: string;
}

export interface DeviceStats {
  power: number;
  voltage: number;
  amperage: number;
  today: number;
  yesterday: number;
  total: number;
}

export interface DeviceFormData {
  name: string;
  ip: string;
}

// API Response Types

export type GetDevicesResponse = DeviceWithState[];

export interface TodayConsumptionResponse {
  plug_name: string;
  consumption: string;
  unit: string;
}

export interface YesterdayConsumptionResponse {
  plug_name: string;
  consumption: string;
  unit: string;
}

export interface HistoryConsumptionResponse {
  range: string;
  consumption: string;
  unit: string;
}

export interface VoltageResponse {
  voltage: string;
  unit: string;
}

export interface PowerResponse {
  power: string;
  unit: string;
}

export interface StateResponse {
  plug_name?: string;
  state: string;
}

export interface CurrentResponse {
  plug_name: string;
  current: string;
  unit: string;
}

export interface StatusResponse {
  [key: string]: any; // Full status JSON object
}
