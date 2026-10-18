
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-label">
            WELCOME TO HUDUMACONNECT
          </span>

          <h1>
            Public Services,
            <span> Made Simpler.</span>
          </h1>

          <p className="hero-description">
            Explore public services, submit sample service requests,
            and track their progress in one convenient place.
            HudumaConnect demonstrates how digital technology can
            make accessing public services easier.
          </p>

          <div className="hero-buttons">
            <Link to="/services" className="hero-btn hero-btn-primary">
              Explore Services
            </Link>

            <Link
              to="/track-request"
              className="hero-btn hero-btn-secondary"
            >
              Track a Request
            </Link>
          </div>

          <div className="hero-note">
            <span className="hero-dot"></span>
            Simple, convenient, and accessible digital services
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-header">
              <div>
                <span className="hero-card-label">
                  HUDUMACONNECT PORTAL
                </span>
                <h3>How can we help you?</h3>
              </div>

              <div className="hero-card-symbol">HC</div>
            </div>

            <div className="hero-service-item">
              <div className="hero-service-icon purple-bg">01</div>

              <div className="hero-service-text">
                <h4>Explore Services</h4>
                <p>Find the service you need</p>
              </div>

              <span className="hero-arrow">→</span>
            </div>

            <div className="hero-service-item">
              <div className="hero-service-icon blue-bg">02</div>

              <div className="hero-service-text">
                <h4>Submit a Request</h4>
                <p>Explore the request process</p>
              </div>

              <span className="hero-arrow">→</span>
            </div>

            <div className="hero-service-item">
              <div className="hero-service-icon green-bg">03</div>

              <div className="hero-service-text">
                <h4>Track Progress</h4>
                <p>Check a sample request status</p>
              </div>

              <span className="hero-arrow">→</span>
            </div>

            <div className="hero-card-footer">
              Your services, one convenient portal.
            </div>
          </div>

          <div className="hero-decoration hero-decoration-one"></div>
          <div className="hero-decoration hero-decoration-two"></div>
        </div>
      </div>

    </section>
  );
}

export default Hero;
