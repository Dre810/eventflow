import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI, paymentsAPI } from '../../services/api';
import PaymentForm from '../../components/Payment/PaymentForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticketCount, setTicketCount] = useState(1);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsAPI.getById(id),
  });

  const handlePaymentSuccess = () => {
    navigate('/bookings');
  };

  if (isLoading) return <LoadingSpinner />;

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Event not found</h2>
        <button 
          onClick={() => navigate('/events')}
          className="btn btn-primary"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const totalAmount = (event.data.price || 0) * ticketCount;

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline mb-6 flex items-center space-x-2"
      >
        <FiArrowLeft />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Summary */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          
          <div className="event-summary">
            <img 
              src={event.data.image || 'https://via.placeholder.com/600x300'} 
              alt={event.data.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            
            <h3 className="text-xl font-semibold mb-2">{event.data.title}</h3>
            <p className="text-gray-600 mb-4">{event.data.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiCalendar className="text-gray-500" />
                <span>{format(new Date(event.data.date), 'PPP p')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMapPin className="text-gray-500" />
                <span>{event.data.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiUsers className="text-gray-500" />
                <span>{event.data.availableTickets || 0} tickets available</span>
              </div>
            </div>
          </div>

          {/* Ticket Counter */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Number of Tickets:</span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  disabled={ticketCount <= 1}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50"
                >
                  -
                </button>
                <span className="text-lg font-bold">{ticketCount}</span>
                <button
                  onClick={() => setTicketCount(ticketCount + 1)}
                  disabled={ticketCount >= (event.data.availableTickets || 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <span className="text-gray-600">Price per ticket:</span>
                <span className="ml-2 font-semibold">${event.data.price || 0}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          <PaymentForm 
            amount={totalAmount}
            eventId={id}
            onSuccess={handlePaymentSuccess}
          />
          
          {/* Payment Security Info */}
          <div className="mt-8 card">
            <h4 className="font-semibold mb-4">Secure Payment</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>128-bit SSL encryption</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>PCI DSS compliant</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No credit card details stored</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Money-back guarantee</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;