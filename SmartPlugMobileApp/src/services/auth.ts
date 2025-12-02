import { api } from './api';
import { storage } from '@/src/utils/storage';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// Mock login function
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Mock API call - in real app, this would be: return api.post('/api/login', credentials);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response
    if (credentials.username && credentials.password) {
      const mockToken = `mock-token-${Date.now()}`;
      await storage.setToken(mockToken);
      return { token: mockToken };
    }
    
    throw new Error('Invalid credentials');
  },

  async logout(): Promise<void> {
    await storage.removeToken();
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getToken();
    return !!token;
  },
};

