import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { capturePayPalOrder } from '../services/patientService';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing your payment...');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const subscriptionId = searchParams.get('subscriptionId');

    if (!token || !subscriptionId) {
      setError('Missing payment details. Please return to your dashboard and try again.');
      setLoading(false);
      return;
    }

    const capture = async () => {
      try {
        await capturePayPalOrder({ orderId: token, subscriptionId });
        setMessage('Payment confirmed. Your subscription is now active.');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to confirm PayPal payment.');
      } finally {
        setLoading(false);
      }
    };

    capture();
  }, [searchParams]);

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Payment Success</h1>
      {loading && <p>{message}</p>}
      {!loading && !error && (
        <>
          <p>{message}</p>
          <button type="button" onClick={() => navigate('/patient')}>
            Go to Dashboard
          </button>
        </>
      )}
      {error && (
        <>
          <p style={{ color: 'red' }}>{error}</p>
          <button type="button" onClick={() => navigate('/patient')}>
            Return to Dashboard
          </button>
        </>
      )}
    </div>
  );
}
