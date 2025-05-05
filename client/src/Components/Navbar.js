
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import api from '../api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isAuth = !!localStorage.getItem('dwellx_token');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('dwellx_token');
    document.cookie = 'dwellx_token=; Max-Age=0';
    navigate('/login');
  };

  // const handleDelete = async () => {
  //   if (!window.confirm('Delete your account?')) return;
  //   try {
  //     await api.delete('/auth/delete');
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   handleLogout();
  // };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-flex">
          {/* Logo */}
          <div className="logo">
            <Link to="/" className="logo-link">
              <span className="logo-text">DwellX</span>
            </Link>
          </div>
          
          {/* Primary Nav */}
          <div className="primary-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/explore" className="nav-link">Explore</Link>
            {isAuth && <Link to="/favorites" className="nav-link">Favorites</Link>}
            {isAuth && <Link to="/generate" className="nav-link">Generate</Link>}
            {isAuth && <Link to="/account" className="nav-link">Account</Link>}
            {isAuth && <Link to="/popular" className="nav-link">Popular</Link>}
          </div>
          
          {/* Secondary Nav */}
          <div className="secondary-nav">
            {!isAuth ? (
              <>
                <Link to="/login" className="login-button">Login</Link>
                <Link to="/register" className="login-button">Register</Link>
              </>
            ) : (
              <>
                <button onClick={handleLogout} className="login-button">Logout</button>
                {/* <button onClick={handleDelete} className="login-button">Delete</button> */}
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="mobile-menu-container">
            <button onClick={toggleMenu} className="mobile-menu-button">
              {isOpen ? (
                <span className="close-icon">✕</span>
              ) : (
                <span className="menu-icon">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'active' : ''}`}>
        <Link to="/" className="mobile-link">Home</Link>
        <Link to="/" className="mobile-link">About</Link>
        {isAuth && <Link to="/account" className="mobile-link">Account</Link>}
        <Link to="/" className="mobile-link">Contact</Link>
        <Link to="/generate" className="mobile-link">Generate</Link>
        <Link to="/popular" className="mobile-link">Popular</Link>
        {!isAuth ? (
          <>
            <Link to="/login" className="mobile-login-button">Login</Link>
            <Link to="/register" className="mobile-login-button">Register</Link>
          </>
        ) : (
          <>
            <button onClick={handleLogout} className="mobile-login-button">Logout</button>
            {/* <button onClick={handleDelete} className="mobile-login-button">Delete</button> */}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;