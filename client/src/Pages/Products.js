import { useState, useEffect } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../App';
import ProductCard from '../components/ProductCard';

function Products() {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        setError('Please log in to view products');
        return;
      }
      try {
        console.log('Fetching products with token:', token); // Debug token
        const res = await axios.get('http://localhost:5001/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Products response:', res.data); // Debug response
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(`Failed to load products: ${err.response?.data?.error || err.message}`);
        console.error('Products fetch error:', err.response?.data || err.message);
      }
    };
    fetchProducts();
  }, [token]);

  if (error) return <div className="text-center text-red-500 text-lg mt-8">{error}</div>;

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Products</h2>
      {Array.isArray(products) && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No products available or loading...</p>
      )}
    </div>
  );
}

export default Products;