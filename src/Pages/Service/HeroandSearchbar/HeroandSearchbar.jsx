
import "./HeroandSearchbar.css";

function HeroandSearcbar() {
  return (
    <section className="services-hero">
      <div className="services-hero-overlay"></div>

      <div className="services-hero-container">
        <div className="services-hero-content">
          <div className="services-hero-badge">
            <span className="services-badge-dot"></span>
            YOUR SERVICES, ONE PLACE
          </div>

          <h1>
            Find the Services
            <span> You Need.</span>
          </h1>

          <p className="services-hero-description">
            Find the right service and report an issue in your community.
          </p>

          <div className="services-hero-note">
            <span className="services-note-icon">✓</span>
            Simple, convenient, and accessible digital services
          </div>
        </div>

        <div className="services-hero-visual">
          <div className="services-visual-glow"></div>

          <div className="services-feature-card">
            <div className="services-feature-top">
              <div className="services-feature-icon">✦</div>

              <div>
                <span className="services-feature-eyebrow">
                  Browse our Services
                </span>
                <h2>Find what you need</h2>
              </div>
            </div>

            <p className="services-feature-description">
              Everything you need to get started, all in one place.
            </p>

            <div className="services-feature-item">
              <div className="services-item-icon identification-icon">
                ID
              </div>

              <div className="services-item-text">
                <h3>Water Supply</h3>
                <p>Report water shortages, leaking pipes, etc.</p>
              </div>

              <span className="services-item-arrow">↗</span>
            </div>

            <div className="services-feature-item">
              <div className="services-item-icon business-icon">
                BZ
              </div>

              <div className="services-item-text">
                <h3>Road and Potholes</h3>
                <p>Report damaged roads, potholes, etc.</p>
              </div>

              <span className="services-item-arrow">↗</span>
            </div>

            <div className="services-feature-item">
              <div className="services-item-icon education-icon">
                ED
              </div>

              <div className="services-item-text">
                <h3>Waste Collection</h3>
                <p>
                  Report waste, uncollected garbage, and illegal dumping.
                </p>
              </div>

              <span className="services-item-arrow">↗</span>
            </div>

            <div className="services-feature-footer">
              <span className="services-footer-check">✓</span>
              Explore other services at your convenience
            </div>
          </div>

        

          <div className="services-hero-orbit services-orbit-one"></div>
          <div className="services-hero-orbit services-orbit-two"></div>
        </div>
      </div>

      <div className="services-hero-bottom">
        <span></span>
        EXPLORE SERVICES WITH EASE
        <span></span>
      </div>
    </section>
  );
}

export default HeroandSearcbar;