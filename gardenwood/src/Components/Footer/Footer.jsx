
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">

      <div className="footer-container">

        {/* Footer Columns */}
        <div className="footer-content">

          {/* Contact */}
          <div className="footer-column footer-contact">
            <span className="footer-label">Əlaqə</span>

            <a href="/contact">Bizimlə əlaqə</a>
            <a href="mailto:info@gardenwood.az">
              info@gardenwood.az
            </a>
            <a href="/contact" className="footer-accent">
              Ünvanımız
            </a>
          </div>

          {/* Discover */}
          <div className="footer-column">
            <span className="footer-label">Kəşf edin</span>

            <a href="/">Ana səhifə</a>
            <a href="/products">Məhsullar</a>
            <a href="/about">Haqqımızda</a>
            <a href="/contact">Əlaqə</a>
          </div>

          {/* Social Media */}
          <div className="footer-column">
            <span className="footer-label">Bizi izləyin</span>

            <a href="https://instagram.com/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://pinterest.com/" target="_blank" rel="noreferrer">
              Pinterest
            </a>
          </div>

        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Brand Name */}
        <div className="footer-brand">
          GARDEN WOOD
        </div>

        {/* Bottom Footer */}
        <div className="footer-bottom">

          <span className="footer-copyright">
            © {new Date().getFullYear()} Garden Wood. Bütün hüquqlar qorunur.
          </span>

          <p className="footer-description">
            Bağınız üçün zövq, rahatlıq və keyfiyyət.
          </p>

          <div className="footer-legal">
            <a href="/privacy-policy">Məxfilik</a>
            <span>•</span>
            <a href="/terms">İstifadə şərtləri</a>
          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
