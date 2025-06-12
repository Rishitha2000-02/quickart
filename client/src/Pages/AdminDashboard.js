import { useState, useEffect } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../App';

function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [orderCount, setOrderCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', category: '' });
  const [newUser, setNewUser] = useState({ email: '', password: '', is_admin: false });
  const [error, setError] = useState(null);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(null);
  const [showDeleteProductConfirm, setShowDeleteProductConfirm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No authentication token');
        return;
      }
      try {
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          axios.get('http://localhost:5001/api/admin/orders/count', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setOrderCount(ordersRes.data.count || 0);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  const handleDeleteUser = async (id) => {
    if (showDeleteUserConfirm === id) {
      try {
        await axios.delete(`http://localhost:5001/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(users.filter(user => user.id !== id));
        setShowDeleteUserConfirm(null);
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    } else {
      setShowDeleteUserConfirm(id);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/admin/users', newUser, { headers: { Authorization: `Bearer ${token}` } });
      setUsers([...users, res.data]);
      setNewUser({ email: '', password: '', is_admin: false });
    } catch (err) {
      setError('Failed to add user');
      console.error(err);
    }
  };

  const handleEditUser = async (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
      const newEmail = prompt('Enter new email:', user.email);
      const newIsAdmin = ('Set as admin?');
      if (newEmail) {
        try {
          await axios.put(`http://localhost:5001/api/admin/users/${id}`, { email: newEmail, is_admin: newIsAdmin }, { headers: { Authorization: `Bearer ${token}` } });
          setUsers(users.map(u => u.id === id ? { ...u, email: newEmail, is_admin: newIsAdmin } : u));
        } catch (err) {
          setError('Failed to edit user');
          console.error(err);
        }
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/admin/products', newProduct, { headers: { Authorization: `Bearer ${token}` } });
      setProducts([...products, res.data]);
      setNewProduct({ name: '', price: '', image: '', category: '' });
    } catch (err) {
      setError('Failed to add product');
      console.error(err);
    }
  };

  const handleEditProduct = async (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const newName = prompt('Enter new name:', product.name);
      const newPrice = prompt('Enter new price:', product.price);
      const newImage = prompt('Enter new image URL:', product.image);
      const newCategory = prompt('Enter new category:', product.category);
      if (newName && newPrice && newImage && newCategory) {
        try {
          await axios.put(`http://localhost:5001/api/admin/products/${id}`, { name: newName, price: newPrice, image: newImage, category: newCategory }, { headers: { Authorization: `Bearer ${token}` } });
          setProducts(products.map(p => p.id === id ? { ...p, name: newName, price: newPrice, image: newImage, category: newCategory } : p));
        } catch (err) {
          setError('Failed to edit product');
          console.error(err);
        }
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (showDeleteProductConfirm === id) {
      try {
        await axios.delete(`http://localhost:5001/api/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setProducts(products.filter(product => product.id !== id));
        setShowDeleteProductConfirm(null);
      } catch (err) {
        setError('Failed to delete product');
        console.error(err);
      }
    } else {
      setShowDeleteProductConfirm(id);
    }
  };

  if (error) return <div className="text-center text-red-500 text-lg mt-8">{error}</div>;

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Admin Dashboard</h2>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <p className="text-lg text-gray-700 mb-4">Total Orders: {orderCount}</p>
        <h3 className="text-xl font-semibold text-blue-700 mt-6">Users</h3>
        <ul className="list-disc pl-5 mb-4">
          {Array.isArray(users) && users.map(user => (
            <li key={user.id} className="py-2 border-b">
              {user.email} (Admin: {user.is_admin ? 'Yes' : 'No'}) 
              <button onClick={() => handleEditUser(user.id)} className="btn btn-secondary ml-4">Edit</button>
              <button onClick={() => handleDeleteUser(user.id)} className={`ml-2 ${showDeleteUserConfirm === user.id ? 'btn-danger' : 'btn'}`}>
                {showDeleteUserConfirm === user.id ? 'Confirm Delete' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold text-blue-700 mt-6">Add New User</h3>
        <form onSubmit={handleAddUser} className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-700">Email:</label>
            <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Password:</label>
            <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Admin:</label>
            <input type="checkbox" checked={newUser.is_admin} onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })} className="mr-2" />
          </div>
          <button type="submit" className="btn w-full">Add User</button>
        </form>
        <h3 className="text-xl font-semibold text-blue-700 mt-6">Products</h3>
        <ul className="list-disc pl-5 mb-4">
          {Array.isArray(products) && products.map(product => (
            <li key={product.id} className="py-2 border-b">
              {product.name} - ₹{product.price} 
              <button onClick={() => handleEditProduct(product.id)} className="btn btn-secondary ml-4">Edit</button>
              <button onClick={() => handleDeleteProduct(product.id)} className={`ml-2 ${showDeleteProductConfirm === product.id ? 'btn-danger' : 'btn'}`}>
                {showDeleteProductConfirm === product.id ? 'Confirm Delete' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold text-blue-700 mt-6">Add New Product</h3>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-gray-700">Name:</label>
            <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Price:</label>
            <input type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Image URL:</label>
            <input type="text" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700">Category:</label>
            <input type="text" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required className="w-full p-2 border rounded" />
          </div>
          <button type="submit" className="btn w-full">Add Product</button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;