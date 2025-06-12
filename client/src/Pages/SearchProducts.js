import { useState, useEffect } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../App';
import ProductCard from '../components/ProductCard';

function SearchProducts() {
  const { token } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token || !searchQuery.trim()) {
        setProducts([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5001/api/admin/products/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Failed to search products');
        console.error(err);
      }
    };
    fetchProducts();
  }, [token, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (error) return <div className="text-center text-red-500 text-lg mt-8">{error}</div>;

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Search Products</h2>
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Enter product name..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
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
        <p className="text-center text-gray-500 text-lg">No products found. Try a different search.</p>
      )}
    </div>
  );
}

export default SearchProducts;