// import React, { useState, useContext } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import { clearCart } from '../redux/cartSlice';
// import api from '../utils/api';

// const Checkout = () => {
//   const { user } = useContext(AuthContext);
//   const cartItems = useSelector((state) => state.cart.cartItems);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [address, setAddress] = useState({
//     fullName: '', street: '', city: '', postalCode: '', country: ''
//   });

//   const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

//   const handlePayment = async () => {
//     try {
//       // Backend me payment route nahi hai, direct bypass karo
//       const fallback = window.confirm("Razorpay not configured. Use Test Mode to place order?");
//       if (fallback) {
//         return bypassPayment();
//       } else {
//         return alert("Payment cancelled");
//       }
//     } catch (error) {
//       console.error('Order Error:', error);
//       alert("Payment failed to initialize");
//     }
//   };

//   const bypassPayment = async () => {
//     try {
//       console.log('User Token:', user?.token); // ← Debug karo token aa raha ya nahi
      
//       if (!user?.token) {
//         alert('Please login again. Token missing.');
//         navigate('/login');
//         return;
//       }

//       const saveOrderRes = await api.post('/orders', {
//         items: cartItems,
//         totalAmount: totalPrice,
//         address,
//         paymentId: 'bypass_txn_' + Date.now()
//       }, {
//         headers: { Authorization: `Bearer ${user.token}` }
//       });
      
//       if (saveOrderRes.status === 201 || saveOrderRes.status === 200) {
//         dispatch(clearCart());
//         navigate('/ordersuccess');
//       }
//     } catch (error) {
//       console.error('Bypass Error:', error.response?.data || error);
//       if (error.response?.status === 401) {
//         alert('Session expired. Please login again.');
//         navigate('/login');
//       } else {
//         alert('Order saving failed');
//       }
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!user) {
//       alert("Please login first");
//       navigate('/login');
//       return;
//     }
//     handlePayment();
//   };

//   return (
//     <div className="checkout-container">
//       <h2>Checkout</h2>
//       <div className="checkout-content">
//         <form onSubmit={handleSubmit} className="shipping-form">
//           <h3>Shipping Address</h3>
//           <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
//           <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
//           <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
//           <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
//           <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />
//           <div className="checkout-summary">
//             <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
//             <button type="submit" className="btn">Pay Now</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Checkout;

// import React, { useState, useContext } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import { clearCart } from '../redux/cartSlice';
// import api from '../utils/api';

// const Checkout = () => {
//   const { user } = useContext(AuthContext);
//   const cartItems = useSelector((state) => state.cart.cartItems);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [address, setAddress] = useState({
//     fullName: '', street: '', city: '', postalCode: '', country: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handlePayment = async () => {
//     setLoading(true);
//     try {
//       if (!user?.token) {
//         alert('Please login first');
//         navigate('/login');
//         return;
//       }

//       if (cartItems.length === 0) {
//         alert('Cart is empty');
//         return;
//       }

//       // 1. Razorpay SDK load karo
//       const isLoaded = await loadRazorpayScript();
//       if (!isLoaded) {
//         alert('Razorpay SDK failed to load');
//         return;
//       }

//       // 2. Backend se order banao - amount rupees me bhejo
//       const { data } = await api.post('/payment/createorder', {
//         amount: totalPrice // ✅ Backend khud *100 karega
//       }, {
//         headers: { Authorization: `Bearer ${user.token}` }
//       });

//       if (!data.success) {
//         alert('Failed to create order');
//         return;
//       }

//       // 3. Razorpay options - key_id backend se aayega
//       const options = {
//         key: data.key_id, // ✅ Backend se aa raha hai
//         amount: data.order.amount, // paise me hai
//         currency: data.order.currency,
//         name: 'Your Store',
//         description: 'Order Payment',
//         order_id: data.order.id,
//         handler: async function (response) {
//           // 4. Payment success ke baad verify karo
//           try {
//             const verifyRes = await api.post('/payment/verify', {
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               orderData: { // ✅ Backend orderData maang raha hai
//                 items: cartItems,
//                 totalAmount: totalPrice,
//                 address: address
//               }
//             }, {
//               headers: { Authorization: `Bearer ${user.token}` }
//             });

//             if (verifyRes.data.success) {
//               dispatch(clearCart());
//               navigate('/ordersuccess');
//             } else {
//               alert('Payment verification failed: ' + verifyRes.data.message);
//             }
//           } catch (error) {
//             console.error('Verify Error:', error.response?.data || error);
//             alert('Payment verification failed');
//           }
//         },
//         prefill: {
//           name: address.fullName,
//           email: user.email,
//           contact: user.phone || '9999999999'
//         },
//         theme: {
//           color: '#f97316'
//         },
//         modal: {
//           ondismiss: function() {
//             setLoading(false);
//           }
//         }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.on('payment.failed', function (response) {
//         console.error('Payment Failed:', response.error);
//         alert('Payment failed: ' + response.error.description);
//         setLoading(false);
//       });
//       rzp.open();

//     } catch (error) {
//       console.error('Payment Error:', error.response?.data || error);
//       alert(error.response?.data?.message || 'Payment failed to initialize');
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!user) {
//       alert("Please login first");
//       navigate('/login');
//       return;
//     }
//     handlePayment();
//   };

//   return (
//     <div className="checkout-container">
//       <h2>Checkout</h2>
//       <div className="checkout-content">
//         <form onSubmit={handleSubmit} className="shipping-form">
//           <h3>Shipping Address</h3>
//           <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
//           <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
//           <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
//           <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
//           <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />
//           <div className="checkout-summary">
//             <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
//             <button type="submit" className="btn" disabled={loading}>
//               {loading ? 'Processing...' : 'Pay Now'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Checkout;


// import React, { useState, useContext } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import { clearCart } from '../redux/cartSlice';
// import api from '../utils/api';

// const Checkout = () => {
//   const { user } = useContext(AuthContext);
//   const cartItems = useSelector((state) => state.cart.cartItems);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [address, setAddress] = useState({
//     fullName: '', street: '', city: '', postalCode: '', country: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

// const handlePayment = async () => {
//   setLoading(true);
  
//   try {
//     // ✅ Yaha fullname add kar de
//     const formattedAddress = {
//       fullname: address.fullname || address.name || user.name, // ✅ Ye line add kar
//       street: address.street,
//       city: address.city,
//       postalCode: address.postalCode,
//       country: address.country
//     };

//     const formattedItems = cartItems.map(item => ({
//       product: item._id || item.product,
//       quantity: item.qty || item.quantity,
//       price: item.price
//     }));

//     const orderRes = await api.post('/payment/createorder', {
//       amount: totalPrice
//     });

//     const options = {
//       key: orderRes.data.key_id,
//       amount: orderRes.data.order.amount,
//       currency: "INR",
//       name: "Your Store",
//       description: "Test Transaction",
//       order_id: orderRes.data.order.id,
//       handler: async function (response) {
//         try {
//           const verifyRes = await api.post('/payment/verify', {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             orderData: {
//               items: formattedItems,
//               totalAmount: totalPrice,
//               address: formattedAddress // ✅ Ab fullname ke sath jayega
//             }
//           });
          
//           toast.success("Payment Successful");
//           navigate('/orders');
//         } catch (error) {
//           toast.error("Payment verification failed");
//           console.log(error);
//         }
//       },
//       prefill: {
//         name: user.name, // ✅ Razorpay me bhi prefill ho jayega
//         email: user.email,
//       },
//       theme: { color: "#3399cc" }
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   } catch (error) {
//     toast.error("Something went wrong");
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!user) {
//       alert("Please login first");
//       navigate('/login');
//       return;
//     }
//     handlePayment();
//   };

//   return (
//     <div className="checkout-container">
//       <h2>Checkout</h2>
//       <div className="checkout-content">
//         <form onSubmit={handleSubmit} className="shipping-form">
//           <h3>Shipping Address</h3>
//           <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
//           <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
//           <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
//           <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
//           <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />
//           <div className="checkout-summary">
//             <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
//             <button type="submit" className="btn" disabled={loading}>
//               {loading ? 'Processing...' : 'Pay Now'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Checkout;

import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';
import api from '../utils/api';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });
  const [loading, setLoading] = useState(false);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      if (!user?.token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      if (cartItems.length === 0) {
        alert('Cart is empty');
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load');
        setLoading(false);
        return;
      }

      const formattedAddress = {
        fullname: address.fullName,
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country
      };

      const formattedItems = cartItems.map(item => ({
        product: item._id || item.product,
        quantity: item.qty || item.quantity,
        price: item.price
      }));

      const orderRes = await api.post('/payment/createorder', {
        amount: totalPrice
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const options = {
        key: orderRes.data.key_id,
        amount: orderRes.data.order.amount,
        currency: "INR",
        name: "Your Store",
        description: "Test Transaction",
        order_id: orderRes.data.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                items: formattedItems,
                totalAmount: totalPrice,
                address: formattedAddress
              }
            }, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            
            if (verifyRes.data.success) {
              alert("Payment Successful");
              dispatch(clearCart());
              navigate('/ordersuccess');
            }
          } catch (error) {
            alert("Payment verification failed");
            console.log(error);
          }
        },
        prefill: {
          name: address.fullName,
          email: user.email,
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment Failed:', response.error);
        alert('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();
      
    } catch (error) {
      console.error('Payment Error:', error.response?.data || error);
      alert(error.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first");
      navigate('/login');
      return;
    }
    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
          <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
          <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
          <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
          <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />
          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;