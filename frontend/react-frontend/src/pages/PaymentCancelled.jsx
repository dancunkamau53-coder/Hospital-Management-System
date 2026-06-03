import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Payment Cancelled</h1>
      <p>Your PayPal payment was cancelled. You can try again from the dashboard.</p>
      <button type="button" onClick={() => navigate('/patient')}>
        Return to Dashboard
      </button>
    </div>
  );
}
