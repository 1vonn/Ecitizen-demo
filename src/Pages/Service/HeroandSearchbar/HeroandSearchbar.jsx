
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroandSearchbar.css";

function HeroandSearcbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const categories = [
    "Identification",
    "Business",
    "Education",
    "Local Services",
  ];

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) return;

    // Pass the search term to the Services page URL.
    // The service catalogue can use this query to filter results.
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (category) => {
    setSearchTerm(category);
  };

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
            Discover public service information in one convenient place.
            Explore available services, learn what you need, and get started
            with your request.
          </p>

          <form
            className="services-search-form"
            onSubmit={handleSearch}
            role="search"
          >
            <span className="services-search-icon" aria-hidden="true">
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m16 16 4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search for a service..."
              aria-label="Search available services"
            />

            <button type="submit" className="services-search-button">
              Search
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="services-popular-searches">
            <span>Try searching:</span>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="services-search-tag"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>

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
                  HUDUMACONNECT
                </span>
                <h2>Your Service Hub</h2>
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
                <h3>Identification</h3>
                <p>Identity service information</p>
              </div>

              <span className="services-item-arrow">↗</span>
            </div>

            <div className="services-feature-item">
              <div className="services-item-icon business-icon">
                BZ
              </div>

              <div className="services-item-text">
                <h3>Business Services</h3>
                <p>Business-related information</p>
              </div>

              <span className="services-item-arrow">↗</span>
            </div>

            <div className="services-feature-item">
              <div className="services-item-icon education-icon">
                ED
              </div>

              <div className="services-item-text">
                <h3>Education</h3>
                <p>Education service information</p>
              </div>

              <span className="services-item-arrow">↗</span>
            </div>

            <div className="services-feature-footer">
              <span className="services-footer-check">✓</span>
              Explore services at your convenience
            </div>
          </div>

          <div className="services-floating-card">
            <div className="services-floating-icon">⌕</div>
            <div>
              <strong>Find it faster</strong>
              <span>Search in seconds</span>
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
