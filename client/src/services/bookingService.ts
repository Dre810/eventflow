// src/services/bookingService.ts
import api from './api';
import { Booking, BookingFormData, UserStats } from '../types';

class BookingService {
  // Create booking
  async createBooking(bookingData: BookingFormData): Promise<Booking> {
    const response = await api.post('/bookings', bookingData);
    return response;
  }

  // Get user's bookings
  async getMyBookings(page = 1, limit = 10): Promise<{ bookings: Booking[]; pagination: any }> {
    const response = await api.get(`/bookings/my-bookings?page=${page}&limit=${limit}`);
    return response;
  }

  // Get single booking
  async getBooking(id: number): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response;
  }

  // Cancel booking
  async cancelBooking(id: number): Promise<void> {
    await api.post(`/bookings/${id}/cancel`);
  }

  // Create payment intent
  async createPaymentIntent(bookingId: number): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const response = await api.post(`/bookings/${bookingId}/payment-intent`);
    return response;
  }

  // Confirm payment
  async confirmPayment(bookingId: number, paymentIntentId: string): Promise<{ booking: Booking; payment: any }> {
    const response = await api.post(`/bookings/${bookingId}/confirm-payment`, { paymentIntentId });
    return response;
  }

  // Get booking statistics
  async getBookingStats(): Promise<UserStats> {
    const response = await api.get('/bookings/stats');
    return response;
  }

  // Get bookings for event (admin only)
  async getEventBookings(eventId: number, page = 1, limit = 20): Promise<{ bookings: Booking[]; pagination: any }> {
    const response = await api.get(`/bookings/event/${eventId}?page=${page}&limit=${limit}`);
    return response;
  }

  // Check in attendee
  async checkInAttendee(bookingId: number): Promise<Booking> {
    // Note: We need to implement this endpoint in backend
    const response = await api.post(`/bookings/${bookingId}/checkin`);
    return response;
  }
}

export default new BookingService();