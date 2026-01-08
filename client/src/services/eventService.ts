// src/services/eventService.ts
import api from './api';
import { Event, EventFormData, EventFilters, Ticket, TicketFormData } from '../types';

class EventService {
  // Get all events
  async getEvents(filters: EventFilters = {}): Promise<{ events: Event[]; pagination: any }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/events?${params.toString()}`);
    return response;
  }

  // Get single event
  async getEvent(id: number): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response;
  }

  // Create event
  async createEvent(eventData: EventFormData): Promise<Event> {
    const response = await api.post('/events', eventData);
    return response;
  }

  // Update event
  async updateEvent(id: number, eventData: Partial<EventFormData>): Promise<Event> {
    const response = await api.put(`/events/${id}`, eventData);
    return response;
  }

  // Delete event
  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/events/${id}`);
  }

  // Get featured events
  async getFeaturedEvents(limit = 3): Promise<Event[]> {
    const response = await api.get(`/events/featured?limit=${limit}`);
    return response;
  }

  // Get upcoming events
  async getUpcomingEvents(limit = 6): Promise<Event[]> {
    const response = await api.get(`/events/upcoming?limit=${limit}`);
    return response;
  }

  // Get event categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/events/categories');
    return response;
  }

  // Get tickets for event
  async getEventTickets(eventId: number): Promise<Ticket[]> {
    // Note: We need to implement this endpoint in backend
    const response = await api.get(`/events/${eventId}/tickets`);
    return response;
  }

  // Create ticket for event
  async createTicket(ticketData: TicketFormData): Promise<Ticket> {
    // Note: We need to implement this endpoint in backend
    const response = await api.post('/tickets', ticketData);
    return response;
  }

  // Update ticket
  async updateTicket(id: number, ticketData: Partial<TicketFormData>): Promise<Ticket> {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response;
  }

  // Delete ticket
  async deleteTicket(id: number): Promise<void> {
    await api.delete(`/tickets/${id}`);
  }

  // Search events
  async searchEvents(query: string, filters: EventFilters = {}): Promise<{ events: Event[]; pagination: any }> {
    const params = new URLSearchParams({ search: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/events/search?${params.toString()}`);
    return response;
  }

  // Get events by organizer
  async getEventsByOrganizer(organizerId: number, page = 1, limit = 10): Promise<{ events: Event[]; pagination: any }> {
    const response = await api.get(`/events/organizer/${organizerId}?page=${page}&limit=${limit}`);
    return response;
  }
}

export default new EventService();