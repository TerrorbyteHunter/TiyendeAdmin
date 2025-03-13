// User related types
export interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "staff";
  active: boolean;
  lastLogin?: Date;
}

export interface LoginResponse {
  user: UserData;
  token: string;
}

// Dashboard related types
export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeVendors: number;
  activeRoutes: number;
  recentBookings: any[];
  recentActivities: any[];
}

// Chart related types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: {
    legend?: {
      position?: 'top' | 'left' | 'right' | 'bottom' | 'center';
      display?: boolean;
    };
    tooltip?: {
      enabled?: boolean;
    };
  };
  scales?: {
    y?: {
      beginAtZero?: boolean;
    };
  };
}

// Form state types
export interface FormState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string | null;
}

// Modal state types
export interface ModalState {
  isOpen: boolean;
  type: 'create' | 'edit' | 'delete' | 'view';
  itemId?: number;
}
