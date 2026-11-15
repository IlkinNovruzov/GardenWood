
import React from 'react';
import { Link } from "react-router-dom";
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">

      <div className="footer-container">

        <div className="footer-content">

          {/* Contact */}
          <div className="footer-column footer-contact">

            <span className="footer-label">Əlaqə</span>

            <Link to="/contact">Bizimlə əlaqə</Link>

            <a href="mailto:info@gardenwood.az">
              info@gardenwood.az
            </a>

            <Link to="/contact" className="footer-accent">
              Ünvanımız
            </Link>

          </div>

          {/* Discover */}
          <div className="footer-column">

            <span className="footer-label">Kəşf edin</span>

            <Link to="/">Ana səhifə</Link>
            <Link to="/products">Məhsullar</Link>
            <Link to="/about">Haqqımızda</Link>
            <Link to="/contact">Əlaqə</Link>

          </div>

          {/* Social Media */}
          <div className="footer-column">

            <span className="footer-label">Bizi izləyin</span>

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>

            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          </div>

        </div>

        <div className="footer-divider"></div>

        {/* Brand */}
        <div className="footer-brand">
          GARDEN WOOD
        </div>

        {/* Bottom */}
        <div className="footer-bottom">

          <span className="footer-copyright">
            © {new Date().getFullYear()} Garden Wood.
            Bütün hüquqlar qorunur.
          </span>

          <p className="footer-description">
            Bağınız üçün zövq, rahatlıq və keyfiyyət.
          </p>

          <div className="footer-legal">

            <Link to="/privacy-policy">
              Məxfilik
            </Link>

            <span>•</span>

            <Link to="/terms">
              İstifadə şərtləri
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
