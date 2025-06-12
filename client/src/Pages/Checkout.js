import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

function Checkout() {
  const { token, cart, setCart } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!token) {
      alert('Please log in to checkout');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const orderData = { items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })) };
      console.log('Sending checkout data:', orderData); // Debug sent data
      const res = await axios.post(
        'http://localhost:5001/api/admin/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Server response:', res.data); // Debug response
      if (res.status === 201) {
        alert('Order placed successfully!');
        setCart([]); // Clear cart
        navigate('/');
      }
    } catch (err) {
      console.error('Checkout error:', err.response?.data || err.message, err.stack); // Detailed error
      alert(`Checkout failed: ${err.response?.data?.error || err.message}`);
    }
  };

  if (!token) return <div className="text-center text-red-500 text-lg mt-8">Please log in to checkout.</div>;

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Checkout</h2>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg text-center">
        {cart.length > 0 ? (
          <>
            <p className="text-gray-700 mb-4">Review your items and proceed to checkout.</p>
            <ul className="mb-4">
              {cart.map((item) => (
                <li key={item.id} className="py-2 border-b">
                  {item.name} - ₹{item.price} x {item.quantity}
                </li>
              ))}
            </ul>
            <p className="text-xl font-bold text-blue-700 mb-4">
              Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </p>
            <button onClick={handleCheckout} className="btn btn-secondary w-full">Proceed to Checkout</button>
          </>
        ) : (
          <p className="text-gray-500">Your cart is empty. Add items to proceed.</p>
        )}
      </div>
    </div>
  );
}

export default Checkout;