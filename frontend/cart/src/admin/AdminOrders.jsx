import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { normalizeArray } from '../utils/api';

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOrders(normalizeArray(res.data));
      } catch (error) {
        console.error(error);
        setOrders([]);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.status === 200) {
        setOrders(orders.map(order => order._id === id ? { ...order, status } : order));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>Manage Orders</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={rowStyle}>
              <th style={thStyle}>ORDER ID</th>
              <th style={thStyle}>USER</th>
              <th style={thStyle}>TOTAL</th>
              <th style={thStyle}>DATE</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr style={rowStyle}>
                <td style={tdStyle} colSpan={5}>
                  No orders found.
                </td>
              </tr>
            ) : orders.map(order => {
              const orderId = order._id || order.id || 'unknown';
              const userName = order.userId?.name || order.user?.name || 'Deleted User';
              const total = Number(order.totalAmount ?? order.total ?? order.amount ?? 0);
              const createdAt = order.createdAt || order.createdAtAt || order.createdAt;
              const dateText = createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
              const statusValue = order.status || 'Pending';

              return (
                <tr key={orderId} style={rowStyle}>
                  <td style={tdStyle}>{String(orderId).substring(0, 8)}...</td>
                  <td style={tdStyle}>{userName}</td>
                  <td style={tdStyle}>₹{total.toFixed(2)}</td>
                  <td style={tdStyle}>{dateText}</td>
                  <td style={tdStyle}>
                    <select
                      value={statusValue}
                      onChange={(e) => updateStatus(orderId, e.target.value)}
                      style={{ background: '#09090b', color: '#fff', padding: '6px', border: '1px solid #27272a', borderRadius: '4px', outline: 'none' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const containerStyle = { maxWidth: '1200px', margin: '40px auto', padding: '30px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#fafafa' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const rowStyle = { borderBottom: '1px solid rgba(255,255,255,0.1)' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#a1a1aa', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', textAlign: 'left' };

export default AdminOrders;
