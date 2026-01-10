import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentsAPI } from '../services/api';

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: paymentsAPI.createPaymentIntent,
  });
};

export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: paymentsAPI.confirmPayment,
  });
};

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ['payments', 'history'],
    queryFn: paymentsAPI.getPaymentHistory,
  });
};