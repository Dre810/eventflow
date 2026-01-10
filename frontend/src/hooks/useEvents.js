import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../services/api';
import Swal from 'sweetalert2';

export const useEvents = (params = {}) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      Swal.fire('Success', 'Event created successfully', 'success');
    },
    onError: (error) => {
      Swal.fire('Error', error.response?.data?.message || 'Failed to create event', 'error');
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => eventsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['event', variables.id]);
      queryClient.invalidateQueries(['events']);
      Swal.fire('Success', 'Event updated successfully', 'success');
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      Swal.fire('Deleted', 'Event deleted successfully', 'success');
    },
  });
};