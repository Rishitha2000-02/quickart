import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, createContext, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import Cart from './Pages/cart';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Checkout from './Pages/Checkout';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import Products from './Pages/Products';
import SearchProducts from './Pages/SearchProducts';
import './App.css';

export const AuthContext = createContext();

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));

  useEffect(() => {
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', isAdmin);
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [token, isAdmin, cart]);

  const handleLogout = () => {
    setToken('');
    setIsAdmin(false);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('cart');
  };

  return (
    <AuthContext.Provider value={{ token, setToken, isAdmin, setIsAdmin, cart, setCart, handleLogout }}>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
          <Navbar />
          <main className="container mx-auto py-6 px-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/search-products" element={<SearchProducts />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;