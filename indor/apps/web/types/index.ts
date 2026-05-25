export type UserRole = 'homeowner' | 'renter' | 'realtor' | 'property_manager' | 'provider' | 'admin';

export type OrderStatus =
  | 'Requested'
  | 'Confirmed'
  | 'ProviderAssigned'
  | 'OnTheWay'
  | 'Arrived'
  | 'WorkInProgress'
  | 'EstimateSent'
  | 'Completed'
  | 'Reviewed'
  | 'SavedToPropertyRecord';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Property {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  homeValue?: number;
  maintenanceScore?: number;
  homeSystems?: HomeSystem[];
  _count?: { orders: number; documents: number };
}

export interface HomeSystem {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiry?: string;
  warrantyStatus?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  duration?: string;
  rating?: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  propertyId: string;
  serviceId: string;
  providerId?: string;
  status: OrderStatus;
  bookingDate?: string;
  scheduledDate?: string;
  completedDate?: string;
  totalAmount?: number;
  notes?: string;
  property?: Property;
  service?: Service;
  provider?: Provider;
  user?: User;
  nextStatuses?: OrderStatus[];
}

export interface Provider {
  id: string;
  contactName: string;
  companyName?: string;
  email: string;
  phone?: string;
  status: string;
  rating?: number;
  isVerified: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
