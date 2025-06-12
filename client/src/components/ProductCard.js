import { useContext } from 'react';
import { AuthContext } from '../App';

function ProductCard({ id, name, price, image }) {
  const { token, cart, setCart } = useContext(AuthContext);

  const handleAddToCart = () => {
    if (!token) {
      alert('Please log in to add items to cart');
      return;
    }
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { id, name, price, image, quantity: 1 }]);
    }
    alert(`${name} added to cart!`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
      <img src={image} alt={name} className="w-24 h-24 mx-auto mb-2" />
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-green-600 font-bold">₹{price}</p>
      {token ? (
        <button onClick={handleAddToCart} className="btn mt-2 w-full">Add to Cart</button>
      ) : (
        <p className="text-red-500 mt-2">Please log in to add to cart</p>
      )}
    </div>
  );
}

export default ProductCard;