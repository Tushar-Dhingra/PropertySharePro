export interface EmployeeStats {
    id: string;
    name: string;
    email: string;
    today: number;
    thisWeek: number;
    total: number;
    performance: 'poor' | 'average' | 'good' | 'excellent';
    status: 'ACTIVE' | 'INACTIVE';
}

export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
    status: 'ACTIVE' | 'INACTIVE';
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Property {
    _id: string;
    propertyName: string;
    type: 'Apartment' | 'Villa' | 'Office' | 'Shop' | 'Warehouse' | 'Land' | 'PG' | 'Hostel';
    location: string;
    areaZone: 'North Zone' | 'South Zone' | 'East Zone' | 'West Zone' | 'Central Zone' | 'Suburban';
    rentAmount: number;
    securityDeposit: number;
    maintenanceCharges: number;
    features: PropertyFeatures;
    uploadedBy: User | string;
    uploadedAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface PropertyFeatures {
    parking: boolean;
    gym: boolean;
    security: boolean;
    swimmingPool: boolean;
    balcony: boolean;
    clubhouse: boolean;
    powerBackup: boolean;
    lift: boolean;
    intercom: boolean;
    gasPipeline: boolean;
    wifi: boolean;
    garden: boolean;
    playground: boolean;
    cctv: boolean;
    waterSupply: boolean;
}

export interface Activity {
    _id: string;
    userId: string | User;
    action: 'LOGIN' | 'UPLOAD' | 'EDIT' | 'DELETE';
    propertyId?: string | Property;
    metadata?: {
        propertyName?: string;
        changes?: Record<string, any>;
    };
    timestamp: string;
}

export interface DashboardAnalytics {
    totalProperties: number;
    dailyUploads: number;
    weeklyUploads: number;
    weeklyTrend: number;
    activeEmployees?: number;
}

export interface ChartData {
    date?: string;
    week?: string;
    uploads: number;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
}
