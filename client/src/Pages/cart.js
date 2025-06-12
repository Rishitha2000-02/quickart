import { useContext } from 'react';
import { AuthContext } from '../App';

function Cart() {
  const { token, cart, setCart } = useContext(AuthContext);

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleIncreaseQuantity = (id) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecreaseQuantity = (id) => {
    setCart(cart.map(item =>
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!token) return <div className="text-center text-red-500 text-lg mt-8">Please log in to view your cart.</div>;

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Your Cart</h2>
      {cart.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Your cart is empty. Add items from Home or Products!</p>
      ) : (
        <>
          <div className="grid gap-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <img src={item.image} alt={item.name} className="w-16 h-16" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-green-600 font-bold">₹{item.price} x {item.quantity}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleDecreaseQuantity(item.id)} className="btn btn-secondary">-</button>
                  <button onClick={() => handleIncreaseQuantity(item.id)} className="btn btn-secondary">+</button>
                  <button onClick={() => handleRemoveFromCart(item.id)} className="btn btn-danger">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <h3 className="text-2xl font-bold text-blue-700">Total: ₹{total.toFixed(2)}</h3>
            <button onClick={() => alert('Proceed to Checkout (TBD)')} className="btn btn-secondary mt-4">Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;