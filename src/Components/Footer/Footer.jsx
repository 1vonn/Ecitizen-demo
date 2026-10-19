
import { Link } from "react-router-dom";
import "./Footer.css";


function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand and Introduction */}
        <div className="footer-main">
          <Link to="/" className="footer-brand">
            <div className="footer-brand-icon">PS</div>

            <div className="footer-brand-text">
              <h2>Public Service</h2>
              <span>REQUEST PORTAL</span>
            </div>
          </Link>

          <p className="footer-description">
           Huduma Connect empowers communities to report local issues, track service requests, 
           and make their voices heard. Together, we can build better neighbourhoods through community
            participation and responsive action.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/track-request">Track Request</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        {/* Service Categories */}
        <div className="footer-column">
          <h3>Service Categories</h3>
          <ul>
            <li><Link to="/services">Broken Streetlights</Link></li>
            <li><Link to="/services">Water & Sanitation</Link></li>
            <li><Link to="/services">Garbage Collection</Link></li>
            <li><Link to="/services">Road & Transport</Link></li>
            <li><Link to="/services">Drainage & Sewage</Link></li>
            <li><Link to="/services">Business Permits</Link></li>
          </ul>
        </div>

        {/* Project Information */}
        <div className="footer-column footer-project">
          <h3>About This Project</h3>

          <p>
            Built as a demonstration of an accessible, user-friendly public
            service request portal.
          </p>

    
        </div>
      </div>

    

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Public Service Request System.
          All rights reserved.
        </p>

        <p className="footer-credit">
          Designed &amp; Developed by <strong>Evyonn</strong>
        </p>

        <Link to="/" className="footer-back-to-top">
          Back to Home <span aria-hidden="true">↑</span>
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
