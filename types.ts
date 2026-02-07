
export interface ServiceEntry {
  id: string;
  clientName: string;
  serviceType: string;
  paymentMethod: string;
  value: number;
  date: string;
  description: string;
  category: string;
}

export type AppTab = 'dashboard' | 'services' | 'ai-consultant' | 'media-lab';

export interface DashboardStats {
  totalRevenue: number;
  serviceCount: number;
  averageValue: number;
  revenueByType: { name: string; value: number }[];
  revenueByPayment: { name: string; value: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Fixed: Added User interface to resolve error in Login.tsx
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
