import { api } from './api';
import type { Device, DeviceStats, DeviceFormData } from '@/src/types/device';

// Mock devices storage (in real app, this would be API calls)
let mockDevices: Device[] = [
  { id: 1, name: 'Socket kitchen', ip: '100.10.129.10', status: 'on' },
  { id: 2, name: 'Socket living room', ip: '100.10.129.11', status: 'off' },
  { id: 3, name: 'Socket bathroom', ip: '100.10.129.12', status: 'off' },
];

let nextId = 4;

export const devicesService = {
  async getDevices(): Promise<Device[]> {
    // Mock API call - simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In real app: return api.get('/api/devices');
    return [...mockDevices];
  },

  async getDevice(id: number): Promise<Device> {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In real app: return api.get(`/api/devices/${id}`);
    const device = mockDevices.find(d => d.id === id);
    if (!device) {
      throw new Error('Device not found');
    }
    return device;
  },

  async addDevice(data: DeviceFormData): Promise<Device> {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In real app: return api.post('/api/devices', data);
    const newDevice: Device = {
      id: nextId++,
      name: data.name,
      ip: data.ip,
      status: 'off',
    };
    mockDevices.push(newDevice);
    return newDevice;
  },

  async toggleDevice(id: number): Promise<Device> {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In real app: return api.put(`/api/devices/${id}/toggle`);
    const device = mockDevices.find(d => d.id === id);
    if (!device) {
      throw new Error('Device not found');
    }
    device.status = device.status === 'on' ? 'off' : 'on';
    return device;
  },

  async getDeviceStats(id: number): Promise<DeviceStats> {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In real app: return api.get(`/api/devices/${id}/stats`);
    const device = mockDevices.find(d => d.id === id);
    
    // Return mock stats
    return {
      power: device?.status === 'on' ? 130 : 0,
      voltage: 220,
      amperage: device?.status === 'on' ? 12 : 0,
      today: 90,
      yesterday: 130,
      total: 300,
    };
  },
};

