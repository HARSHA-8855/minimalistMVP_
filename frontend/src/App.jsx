import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ConsultButton from './components/ConsultButton';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import BestSellers from './pages/BestSellers';
import SkinBodyCare from './pages/SkinBodyCare';
import BabyCare from './pages/BabyCare';
import HairCare from './pages/HairCare';
import AIAssistants from './pages/AIAssistants';
import TrackOrder from './pages/TrackOrder';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Consultation from './pages/Consultation';
import ConsultationConfirmation from './pages/ConsultationConfirmation';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Navbar onCartClick={() => setIsCartOpen(true)} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/best-sellers" element={<BestSellers />} />
                  <Route path="/skin-bodycare" element={<SkinBodyCare />} />
                  <Route path="/baby-care" element={<BabyCare />} />
                  <Route path="/hair-care" element={<HairCare />} />
                  <Route path="/ai-assistants" element={<AIAssistants />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/consultation" element={<Consultation />} />
                  <Route path="/consultation-confirmation/:ref" element={<ConsultationConfirmation />} />
                  <Route path="/admin/consultations" element={<AdminDashboard />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
              <Footer />
              <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
              <ConsultButton />
              <Toaster position="top-right" />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
