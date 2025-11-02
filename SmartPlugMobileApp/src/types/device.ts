export interface Device {
  id: number;
  name: string;
  ip: string;
  status: 'on' | 'off';
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

