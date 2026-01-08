// src/types/index.ts

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  avatar?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Event Types
export interface Event {
  id: number;
  title: string;
  description: string;
  short_description: string;
  category: string;
  venue: string;
  address?: string;
  city?: string;
  country?: string;
  start_date: string;
  end_date: string;
  image_url?: string;
  thumbnail_url?: string;
  max_attendees: number;
  current_attendees: number;
  price: number;
  is_free: boolean;
  is_featured: boolean;
  is_published: boolean;
  organizer_id?: number;
  organizer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  title: string;
  description: string;
  short_description?: string;
  category: string;
  venue: string;
  address?: string;
  city?: string;
  country?: string;
  start_date: string;
  end_date: string;
  max_attendees?: number;
  price?: number;
  is_free?: boolean;
  is_featured?: boolean;
  is_published?: boolean;
}

// Ticket Types
export interface Ticket {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  available_quantity: number;
  sale_start?: string;
  sale_end?: string;
  is_active: boolean;
  event_title?: string;
}

export interface TicketFormData {
  event_id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sale_start?: string;
  sale_end?: string;
  is_active?: boolean;
}

// Booking Types
export interface Booking {
  id: number;
  user_id: number;
  event_id: number;
  ticket_id: number;
  quantity: number;
  total_amount: number;
  booking_reference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  notes?: string;
  attended: boolean;
  checkin_time?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  event_title?: string;
  event_start?: string;
  event_image?: string;
  ticket_name?: string;
  ticket_price?: number;
}

export interface BookingFormData {
  event_id: number;
  ticket_id: number;
  quantity: number;
  notes?: string;
}

// Payment Types
export interface Payment {
  id: number;
  booking_id: number;
  user_id: number;
  amount: number;
  currency: string;
  stripe_payment_id?: string;
  stripe_customer_id?: string;
  payment_method?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  receipt_url?: string;
  paid_at?: string;
  created_at: string;
  booking_reference?: string;
  user_name?: string;
  event_title?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Filter Types
export interface EventFilters {
  category?: string;
  is_featured?: boolean;
  is_published?: boolean;
  organizer_id?: number;
  start_date_from?: string;
  start_date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
}

// Dashboard Stats
export interface DashboardStats {
  total_events: number;
  total_bookings: number;
  total_revenue: number;
  upcoming_events: number;
  active_users: number;
}

export interface UserStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  attended: number;
}