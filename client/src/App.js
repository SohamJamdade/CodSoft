import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
// STRIPE IMPORTS
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

// --- 1. NOTIFICATION TOAST ---
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return <div style={toastStyle}>✅ {message}</div>;
}

// --- NEW: SECURE CHECKOUT FORM COMPONENT ---
function CheckoutForm({ total, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    try {
      const { data: { clientSecret } } = await axios.post('http://localhost:5000/api/create-payment-intent', { amount: total });
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        alert("🎉 Payment Successful!");
        onPaymentSuccess();
      }
    } catch (error) {
      alert("Payment failed. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <label style={labelStyle}>Credit or Debit Card</label>
      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9', marginBottom: '15px' }}>
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button disabled={!stripe || isProcessing} style={largeBuyBtn}>
        {isProcessing ? "Processing..." : `Pay ₹${total}`}
      </button>
    </form>
  );
}

// --- 2. LOGIN COMPONENT ---
function LoginPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = { email: formData.email, name: formData.name || formData.email.split('@')[0] };
    setUser(userData);
    localStorage.setItem('swiftCartUser', JSON.stringify(userData));
    navigate("/");
  };

  return (
    <div style={loginContainer}>
      <div style={loginBox}>
        <h1 style={{ color: '#007bff', textAlign: 'center' }}>SwiftCart</h1>
        <form onSubmit={handleSubmit} style={authFormStyle}>
          <h2 style={{ marginBottom: '15px' }}>{isLogin ? 'Sign-In' : 'Create Account'}</h2>
          {!isLogin && (
            <>
              <label style={labelStyle}>Your name</label>
              <input type="text" placeholder="Full name" style={loginInput} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </>
          )}
          <label style={labelStyle}>Email</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={loginInput} required />
          <label style={labelStyle}>Password</label>
          <input type="password" placeholder="At least 6 characters" style={loginInput} required />
          <button type="submit" style={loginBtn}>{isLogin ? 'Continue' : 'Sign Up'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} style={toggleAuthBtn}>
          {isLogin ? 'New to SwiftCart? Create account' : 'Already have an account? Sign-In'}
        </button>
      </div>
    </div>
  );
}

// --- 3. PRODUCT DETAIL PAGE ---
function ProductDetail({ products, addToCart, cartCount, user, handleLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p._id === id);

  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Finding product details...</h2></div>;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <nav style={navStyle}>
        <Link to="/" style={{ textDecoration: 'none' }}><h1 style={{ color: 'white', margin: 0 }}>SwiftCart</h1></Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Hello, {user?.name}</Link>
            <Link to="/cart" style={cartBtnStyle}>🛒 Cart: {cartCount}</Link>
        </div>
      </nav>
      <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={() => navigate("/")} style={backBtn}>← Back to Results</button>
        <div style={detailGrid}>
          <div style={detailImgBox}><img src={product.image} alt={product.name} style={largeImg} /></div>
          <div style={detailInfoBox}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{product.name}</h1>
            <div style={{ color: '#ffa41c', fontSize: '18px', marginBottom: '10px' }}>
                ★★★★☆ <span style={{ color: '#007185', fontSize: '14px' }}>(4.5 stars)</span>
            </div>
            <p style={{ color: '#B12704', fontSize: '28px', fontWeight: 'bold' }}>₹{product.price}</p>
            <hr />
            <h3 style={{ marginTop: '20px' }}>Product Description:</h3>
            <p style={{ lineHeight: '1.6', color: '#333' }}>{product.description}</p>
            <button onClick={() => addToCart(product)} style={largeBuyBtn}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 4. PROFILE PAGE ---
function ProfilePage({ user, orders, handleLogout }) {
    const navigate = useNavigate();
    return (
      <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <nav style={navStyle}>
          <Link to="/" style={{ textDecoration: 'none' }}><h1 style={{ color: 'white', margin: 0 }}>SwiftCart</h1></Link>
          <button onClick={handleLogout} style={signOutBtn}>Sign Out</button>
        </nav>
        <div style={{ padding: '30px 5%', maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={() => navigate("/")} style={backBtn}>← Back to Store</button>
          <div style={profileInfoBox}>
            <h2>Your Account</h2>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
          <h3>Your Orders</h3>
          {orders.length === 0 ? <p>No orders placed yet.</p> : orders.map((order, i) => (
            <div key={i} style={orderCard}>
              <div style={orderHeader}>
                <div><strong>ORDER PLACED</strong><br/>{order.date}</div>
                <div><strong>TOTAL</strong><br/>₹{order.total}</div>
                <div><strong>ORDER #</strong><br/>{order.id}</div>
              </div>
              <div style={{ padding: '15px' }}>
                {order.items.map((item, idx) => (
                  <p key={idx}>{item.name} x {item.quantity}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}

// --- 5. CART PAGE (WITH STRIPE PAYMENT) ---
function CartPage({ cart, setCart, savedItems, setSavedItems, user, handleLogout, setOrders, orders }) {
  const navigate = useNavigate();
  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => item._id === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item));
  };
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const delivery = (subtotal > 500 || subtotal === 0) ? 0 : 40;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + delivery + gst;

  const handleOrderCompletion = () => {
    const newOrder = { id: Math.random().toString(36).substr(2, 9).toUpperCase(), date: new Date().toLocaleDateString('en-IN'), total: total, items: [...cart] };
    setOrders([newOrder, ...orders]);
    setCart([]);
    navigate("/profile");
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <nav style={navStyle}>
        <Link to="/" style={{ textDecoration: 'none' }}><h1 style={{ color: 'white', margin: 0 }}>SwiftCart</h1></Link>
        <button onClick={handleLogout} style={signOutBtn}>Sign Out</button>
      </nav>
      <div style={{ padding: '30px 5%', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2 }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>Shopping Cart</h2>
            {cart.map((item, i) => (
              <div key={i} style={cartItemRow}>
                <img src={item.image} style={{ width: '100px' }} alt="" />
                <div style={{ flex: 1, paddingLeft: '20px' }}>
                  <h4>{item.name}</h4>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <div style={qtyBox}>
                      <button onClick={() => updateQuantity(item._id, -1)} style={qtyBtn}>-</button>
                      <span>{item.quantity || 1}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} style={qtyBtn}>+</button>
                    </div>
                    <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} style={actionBtn}>Delete</button>
                    <button onClick={() => { setSavedItems([...savedItems, item]); setCart(cart.filter((_, idx) => idx !== i)); }} style={actionBtn}>Save for later</button>
                  </div>
                </div>
                <p style={{ fontWeight: 'bold' }}>₹{item.price * (item.quantity || 1)}</p>
              </div>
            ))}
          </div>
          {savedItems.length > 0 && (
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
              <h3>Saved for later</h3>
              {savedItems.map((item, i) => (
                <div key={i} style={cartItemRow}>
                  <img src={item.image} style={{ width: '60px' }} alt="" />
                  <button onClick={() => { setCart([...cart, item]); setSavedItems(savedItems.filter((_, idx) => idx !== i)); }} style={moveBtn}>Move to Cart</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={summaryBox}>
          <h3>Order Summary</h3>
          <div style={billRow}><span>Items:</span> <span>₹{subtotal}</span></div>
          <div style={billRow}><span>Delivery:</span> <span>₹{delivery}</span></div>
          <div style={billRow}><span>GST (18%):</span> <span>₹{gst}</span></div>
          <hr />
          <h2 style={{ color: '#B12704' }}>Total: ₹{total}</h2>
          
          {/* STRIPE ELEMENT WRAPPER */}
          {cart.length > 0 && (
            <Elements stripe={stripePromise}>
              <CheckoutForm total={total} onPaymentSuccess={handleOrderCompletion} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 6. MAIN APP ---
function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const savedUser = localStorage.getItem('swiftCartUser');
    if (savedUser) setUser(JSON.parse(savedUser));
    axios.get('http://localhost:5000/api/products').then(res => setProducts(res.data));
  }, []);

  const handleLogout = () => { localStorage.removeItem('swiftCartUser'); setUser(null); };
  
  const addToCart = (p) => {
    const existing = cart.find(item => item._id === p._id);
    if (existing) {
      setCart(cart.map(item => item._id === p._id ? { ...item, quantity: (item.quantity || 1) + 1 } : item));
    } else {
      setCart([...cart, { ...p, quantity: 1 }]);
    }
    setNotification(`${p.name} added!`);
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Router>
      {notification && <Toast message={notification} onClose={() => setNotification(null)} />}
      <Routes>
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/" element={user ? (
          <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <nav style={navStyle}>
              <Link to="/" style={{ textDecoration: 'none' }}><h1 style={{ color: 'white', margin: 0 }}>SwiftCart</h1></Link>
              <div style={{ flex: 1, maxWidth: '500px', margin: '0 20px' }}>
                <input type="text" placeholder="Search for products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={searchStyle} />
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Hello, {user.name}</Link>
                <Link to="/cart" style={cartBtnStyle}>🛒 Cart: {cart.length}</Link>
                <button onClick={handleLogout} style={signOutBtn}>Sign Out</button>
              </div>
            </nav>
            <div style={filterBarStyle}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={activeCategory === cat ? activeFilterBtn : filterBtn}>{cat}</button>
              ))}
            </div>
            <div style={gridStyle}>
                {filteredProducts.map(p => (
                  <div key={p._id} style={cardStyle}>
                    <Link to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                     <img src={p.image} style={imgStyle} alt="" />
                     <h4 style={{ height: '40px', overflow: 'hidden' }}>{p.name}</h4>
                     <div style={{ color: '#ffa41c', fontSize: '14px', marginBottom: '5px' }}>★★★★☆</div>
                    </Link>
                    <p style={{ fontWeight: 'bold' }}>₹{p.price}</p>
                    <button onClick={() => addToCart(p)} style={addBtn}>Add to Cart</button>
                  </div>
                ))}
            </div>
          </div>
        ) : <Navigate to="/login" />} />
        <Route path="/product/:id" element={user ? <ProductDetail products={products} addToCart={addToCart} cartCount={cart.length} user={user} handleLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage user={user} orders={orders} handleLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/cart" element={user ? <CartPage cart={cart} setCart={setCart} savedItems={savedItems} setSavedItems={setSavedItems} orders={orders} setOrders={setOrders} user={user} handleLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

// --- STYLES ---
const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 5%', backgroundColor: '#131921', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 };
const searchStyle = { width: '100%', padding: '10px 15px', borderRadius: '4px', border: 'none', outline: 'none' };
const filterBarStyle = { display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px 0', backgroundColor: '#232f3e' };
const filterBtn = { padding: '6px 15px', border: 'none', background: 'none', color: '#ddd', cursor: 'pointer', fontWeight: 'bold' };
const activeFilterBtn = { ...filterBtn, color: '#ff9900', borderBottom: '3px solid #ff9900' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', padding: '20px' };
const cardStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' };
const imgStyle = { height: '150px', objectFit: 'contain' };
const addBtn = { backgroundColor: '#ffd814', border: 'none', padding: '10px', borderRadius: '20px', cursor: 'pointer', width: '100%', fontWeight: 'bold' };
const signOutBtn = { background: 'none', border: '1px solid #fff', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };
const cartBtnStyle = { color: '#ff9900', textDecoration: 'none', fontWeight: 'bold' };
const detailGrid = { display: 'flex', gap: '50px', backgroundColor: '#fff', padding: '40px', borderRadius: '10px', flexWrap: 'wrap' };
const detailImgBox = { flex: 1, minWidth: '300px', textAlign: 'center' };
const largeImg = { maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' };
const detailInfoBox = { flex: 1.5, minWidth: '300px' };
const largeBuyBtn = { width: '100%', padding: '12px', backgroundColor: '#ffd814', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' };
const backBtn = { marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#eee' };
const loginContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f3f3' };
const loginBox = { width: '350px', padding: '25px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' };
const loginInput = { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', boxSizing: 'border-box' };
const loginBtn = { width: '100%', padding: '10px', backgroundColor: '#ffd814', border: 'none', borderRadius: '3px', cursor: 'pointer' };
const authFormStyle = { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '10px' };
const labelStyle = { fontSize: '13px', fontWeight: 'bold', display: 'block' };
const toggleAuthBtn = { width: '100%', marginTop: '10px', padding: '10px', cursor: 'pointer', background: 'none', border: '1px solid #ddd' };
const cartItemRow = { display: 'flex', padding: '15px 0', borderBottom: '1px solid #eee', alignItems: 'center' };
const qtyBox = { display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '5px' };
const qtyBtn = { padding: '5px 12px', background: '#f0f2f5', border: 'none', cursor: 'pointer' };
const actionBtn = { background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: '13px' };
const summaryBox = { flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '8px', height: 'fit-content' };
const billRow = { display: 'flex', justifyContent: 'space-between', margin: '10px 0' };
const moveBtn = { backgroundColor: '#ffd814', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' };
const toastStyle = { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#232f3e', color: '#fff', padding: '10px 30px', borderRadius: '50px', zIndex: 2000, fontWeight: 'bold' };
const profileInfoBox = { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', marginBottom: '30px' };
const orderCard = { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px', overflow: 'hidden' };
const orderHeader = { backgroundColor: '#f6f6f6', padding: '15px 20px', display: 'flex', gap: '40px', fontSize: '13px', borderBottom: '1px solid #ddd' };

export default App; 