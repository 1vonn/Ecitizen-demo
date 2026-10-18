
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

function HeaderIcon({ name, size = 20 }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9" />
        <path d="M9 21v-7h6v7" />
      </>
    ),
    services: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </>
    ),
    track: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
        <path d="M11 7v4l3 2" />
      </>
    ),
    about: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    register: (
      <>
        <path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
        <path d="M8 9h6M8 13h4" />
        <circle cx="18" cy="17" r="3" />
        <path d="M18 15.5v3M16.5 17h3" />
      </>
    ),
    logo: (
      <>
        <path d="M3 10 12 3l9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-7h6v7" />
        <path d="M3 21h18" />
      </>
    ),
  };

  return <svg {...commonProps}>{icons[name]}</svg>;
}

function Header() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <header className="site-header">
      <div className="header-content">
        <Link
          to="/"
          className="brand"
          aria-label="HudumaConnect home"
        >
          <div className="brand-icon">
            <HeaderIcon name="logo" size={27} />
          </div>

          <div className="brand-text">
            <h2>HudumaConnect</h2>
            <span>PUBLIC SERVICE PORTAL</span>
          </div>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <ul className="header-nav-content">
            <li>
              <Link to="/" className={isActive("/")}>
                <HeaderIcon name="home" size={18} />
                <span>Home</span>
              </Link>
            </li>

            <li>
              <Link to="/services" className={isActive("/services")}>
                <HeaderIcon name="services" size={18} />
                <span>Services</span>
              </Link>
            </li>

            <li>
              <Link
                to="/track-request"
                className={isActive("/track-request")}
              >
                <HeaderIcon name="track" size={18} />
                <span>Track Request</span>
              </Link>
            </li>

            <li>
              <Link to="/about" className={isActive("/about")}>
                <HeaderIcon name="about" size={18} />
                <span>About</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="login-button">
            <HeaderIcon name="user" size={18} />
            <span>Login</span>
          </Link>

          <Link to="/register" className="register-button">
            <span>Get Started</span>
            <HeaderIcon name="register" size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
