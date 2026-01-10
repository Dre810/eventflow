import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentsAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { FiCreditCard, FiLock, FiCheck } from 'react-icons/fi';
import './PaymentForm.css';

const PaymentForm = ({ amount, eventId, eventTitle, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      Swal.fire('Error', 'Payment system not loaded', 'error');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Show processing modal
      Swal.fire({
        title: 'Processing Payment',
        html: 'Please wait while we process your payment...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // 1. Create payment intent on backend
      const { data: { clientSecret } } = await paymentsAPI.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        eventId,
        currency: 'usd',
        eventTitle,
      });

      // 2. Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: localStorage.getItem('user') 
                ? JSON.parse(localStorage.getItem('user')).name 
                : 'Customer',
            },
          },
          setup_future_usage: 'off_session',
        }
      );

      Swal.close();

      if (stripeError) {
        setError(stripeError.message);
        Swal.fire({
          title: 'Payment Failed',
          text: stripeError.message,
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
      } else if (paymentIntent.status === 'succeeded') {
        // 3. Confirm payment on our backend
        const confirmResponse = await paymentsAPI.confirmPayment({
          paymentIntentId: paymentIntent.id,
          eventId,
          amount: amount,
        });

        setPaymentCompleted(true);
        
        Swal.fire({
          title: 'Payment Successful!',
          html: `
            <div class="text-center">
              <div class="text-5xl mb-4 text-green-500">✓</div>
              <p class="text-lg mb-2">$${amount.toFixed(2)} paid successfully</p>
              <p class="text-gray-600">Transaction ID: ${paymentIntent.id.slice(-8)}</p>
              <p class="text-gray-600 mt-4">Your tickets have been booked!</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'View Bookings',
          showCancelButton: true,
          cancelButtonText: 'Continue Browsing',
        }).then((result) => {
          if (result.isConfirmed) {
            onSuccess();
          }
        });
        
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          if (!Swal.isVisible()) {
            onSuccess();
          }
        }, 5000);
      }
    } catch (err) {
      Swal.close();
      const errorMsg = err.response?.data?.message || 'Payment processing failed';
      setError(errorMsg);
      Swal.fire('Error', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (paymentCompleted) {
    return (
      <div className="payment-completed">
        <div className="success-icon">
          <FiCheck size={64} />
        </div>
        <h3>Payment Completed!</h3>
        <p>Your tickets for "{eventTitle}" have been successfully booked.</p>
        <p className="receipt-info">A receipt has been sent to your email.</p>
        <button onClick={onSuccess} className="btn btn-primary mt-4">
          View My Bookings
        </button>
      </div>
    );
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: '"Inter", -apple-system, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        ':focus': {
          color: '#4361ee',
        },
      },
      invalid: {
        color: '#f72585',
        ':focus': {
          color: '#f72585',
        },
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="payment-form">
      <div className="payment-header">
        <FiCreditCard className="payment-icon" />
        <h3>Payment Details</h3>
      </div>
      
      <div className="amount-summary">
        <div className="amount-row">
          <span>Event:</span>
          <span>{eventTitle}</span>
        </div>
        <div className="amount-row">
          <span>Amount:</span>
          <span className="total-amount">${amount.toFixed(2)}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="payment-form-content">
        <div className="form-group">
          <label className="form-label">
            Card Information
            <span className="secured-badge">
              <FiLock size={12} /> Secure
            </span>
          </label>
          <div className={`card-element-container ${error ? 'error' : ''}`}>
            <CardElement options={cardElementOptions} />
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Billing Info (optional) */}
        <div className="billing-info">
          <h4>Billing Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="As shown on card"
                defaultValue={localStorage.getItem('user') 
                  ? JSON.parse(localStorage.getItem('user')).name 
                  : ''}
              />
            </div>
            <div className="form-group">
              <label className="form-label">ZIP/Postal Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="12345"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className={`pay-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>
        
        <div className="payment-security">
          <FiLock className="lock-icon" />
          <div>
            <p className="security-title">Your payment is secure</p>
            <p className="security-description">
              All transactions are encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>

        <div className="accepted-cards">
          <p>We accept:</p>
          <div className="card-icons">
            <span className="card-icon visa">Visa</span>
            <span className="card-icon mastercard">Mastercard</span>
            <span className="card-icon amex">Amex</span>
            <span className="card-icon discover">Discover</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;