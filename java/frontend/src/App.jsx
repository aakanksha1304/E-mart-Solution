import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import CartPage from './pages/CartPage';
import Footer from './components/Footer';

// Wrapper component to provide navigation capability to Navbar
const NavigationWrapper = () => {
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <Navbar
      onCartClick={handleCartClick}
      onLogoClick={handleLogoClick}
    />
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavigationWrapper />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;