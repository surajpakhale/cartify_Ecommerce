import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const OrderSuccess = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const orderId = location.state?.orderId;
  const [downloading, setDownloading] = useState(false);

  const downloadInvoice = async () => {
    if (!orderId) {
      alert('Order ID not found. Please try again.');
      return;
    }

    try {
      setDownloading(true);
      console.log("📥 Downloading invoice for order:", orderId);
      
      const response = await api.get(`/orders/invoice/${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob'
      });

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("✅ Invoice downloaded successfully");
    } catch (error) {
      console.error("❌ Error downloading invoice:", error);
      alert("Failed to download invoice. Please try again from your profile.");
    } finally {
      setDownloading(false);
    }
  };
  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '50px 30px',
    background: '#18181b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    textAlign: 'center'
  };

  // Auto-download invoice when page loads with orderId
  React.useEffect(() => {
    if (orderId && user?.token) {
      console.log("📄 Order Success - Order ID:", orderId);
      // Auto download after a short delay to ensure page is ready
      const timer = setTimeout(() => {
        downloadInvoice();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [orderId, user?.token]);

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#10b981' }}>✅ Payment Successful!</h2>
      <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '10px' }}>
        Thank you for your order. We have securely received your payment and will process your shipment shortly.
      </p>
      {orderId && (
        <p style={{ color: '#f97316', fontSize: '0.95rem', marginBottom: '30px' }}>
          Order ID: <strong>{orderId.substring(0, 8).toUpperCase()}</strong>
        </p>
      )}
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        {orderId && (
          <button 
            onClick={downloadInvoice}
            disabled={downloading}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.6 : 1,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {downloading ? '📥 Downloading Invoice...' : '📄 Download Invoice'}
          </button>
        )}
        <Link to="/shop" className="btn" style={{ textDecoration: 'none', display: 'inline-block', background: '#10b981' }}>
          Continue Shopping
        </Link>
      </div>
      
      <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '20px' }}>
        Check your <Link to="/profile" style={{ color: '#f97316', textDecoration: 'none' }}>Profile</Link> to view all orders and download invoices anytime.
      </p>
    </div>
  );
};

export default OrderSuccess;
