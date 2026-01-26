import React, { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const navigateToCart = () => setCurrentView('cart');
  const navigateToHome = () => setCurrentView('home');

  return (
    <div className="App">
      <Navbar onCartClick={navigateToCart} onLogoClick={navigateToHome} />

      {currentView === 'home' && <HomePage />}
      {currentView === 'cart' && <CartPage onContinueShopping={navigateToHome} />}

      {(currentView === 'cart' || currentView === 'home') && <Footer />}
      {/* Footer can be globally present, but controlled here if needed. 
          Actually, HomePage ALREADY includes Footer inside it based on my previous edit. 
          Let's check HomePage.jsx content. 
          Result 13 showed HomePage includes Navbar and Footer.
          I need to REMOVE Navbar/Footer from HomePage.jsx and put them in App.jsx 
          OR keep them in HomePage logic but that makes sharing state hard.
          
          BETTER APPROACH:
          Lift Navbar and Footer BACK to App.jsx so they wrap everything.
          This is cleaner for SPA behavior.
      */}
    </div>
  );
}

export default App;
