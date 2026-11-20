import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Home from './Pages/Home/Home';
import About from './Pages/About/About';
import Contact from './Pages/Contact/Contact';
import ProductListPage from './Pages/ProductList/ProductListPage';
import Navbar from './Components/Navbar/Navbar';
import AdminAccess from './Pages/AdminPanel/AdminAccess';
import Dashboard from './Pages/AdminPanel/Dashboard/Dashboard';
import CategoryManager from './Pages/AdminPanel/Category/CategoryManager';
import ProductManager from './Pages/AdminPanel/Product/ProductManager';
import CarouselManager from './Pages/AdminPanel/Carousel/CarouselManager';
import Footer from './Components/Footer/Footer';
import ProductDetails from './Pages/ProductDetails/ProductDetails';
import FurnitureDesigner from './Pages/FurnitureDesigner/FurnitureDesigner';

function App() {

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/searchlist" element={<ProductListPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/adminpanel" element={<AdminAccess />} />
        <Route path="/adminpanel/dashboard" element={<Dashboard />} />
        <Route path="/adminpanel/categories" element={<CategoryManager />} />
        <Route path="/adminpanel/products" element={<ProductManager />} />
        <Route path="/adminpanel/carousels" element={<CarouselManager />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/furniture-designer/:id" element={<FurnitureDesigner />}
        />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App;
