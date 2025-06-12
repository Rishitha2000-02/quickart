import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';

function Navbar() {
  const { token, isAdmin, handleLogout } = useContext(AuthContext);

  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#2c3e50',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '16px',
    gap: '15px',
    flexWrap: 'wrap',
  };

  const linkStyle = {
    color: '#ecf0f1',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  };

  const buttonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>Home</Link>
      <Link to="/cart" style={linkStyle}>Cart</Link>
      {!token ? (
        <>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/signup" style={linkStyle}>Signup</Link>
          <Link to="/admin-login" style={linkStyle}>Admin Login</Link>
        </>
      ) : (
        <>
          {isAdmin ? <Link to="/admin-dashboard" style={linkStyle}>Admin Dashboard</Link> : null}
          <Link to="/products" style={linkStyle}>Products</Link>
          <Link to="/search-products" style={linkStyle}>Search Products</Link>
          <button onClick={handleLogout} style={buttonStyle}>Logout</button>
        </>
      )}
    </nav>
  );
}

export default Navbar;
