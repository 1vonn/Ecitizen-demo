
import { useState } from "react";
import { Link } from "react-router-dom";
import "./ServiceCategories.css";
const services = [
  {
    number: "01",
    category: "STREETLIGHTS",
    group: "Streetlights",
    title: "Broken Streetlights",
    icon: "💡",
    description:
      "Report broken or faulty streetlights and request repairs to improve safety on public roads.",
    link: "/submit-request",
    color: "orange",
    time: "Report a faulty streetlight",
  },
  {
    number: "02",
    category: "WATER & SANITATION",
    group: "Water & Sanitation",
    title: "Water and Sanitation",
    icon: "🚰",
    description:
      "Report water supply interruptions, leaking pipes, water quality concerns, and sanitation issues.",
    link: "/submit-request",
    color: "blue",
    time: "Report a water or sanitation issue",
  },
  {
    number: "03",
    category: "WASTE MANAGEMENT",
    group: "Garbage Collection",
    title: "Garbage Collection",
    icon: "🗑️",
    description:
      "Report uncollected garbage, overflowing waste bins, and illegal dumping in public areas.",
    link: "/submit-request",
    color: "green",
    time: "Report a waste collection issue",
  },
  {
    number: "04",
    category: "ROADS & TRANSPORT",
    group: "Roads & Transport",
    title: "Road and Transport",
    icon: "🛣️",
    description:
      "Report damaged roads, potholes, and other public road or transport infrastructure concerns.",
    link: "/submit-request",
    color: "purple",
    time: "Report a road or transport issue",
  },
  {
    number: "05",
    category: "DRAINAGE & SEWERAGE",
    group: "Drainage & Sewerage",
    title: "Drainage and Sewerage",
    icon: "🌊",
    description:
      "Report blocked drains, overflowing sewers, and drainage problems that may cause flooding.",
    link: "/submit-request",
    color: "teal",
    time: "Report a drainage or sewer issue",
  },
  {
    number: "06",
    category: "BUSINESS LICENSING",
    group: "Business Permits",
    title: "Business Permits",
    icon: "🏪",
    description:
      "Request guidance on business permit applications, renewals, and related licensing issues.",
    link: "/submit-request",
    color: "pink",
    time: "Business permit assistance",
  },
];

const categories = [
  "All Services",
  "Streetlights",
  "Water & Sanitation",
  "Garbage Collection",
  "Roads & Transport",
  "Drainage & Sewerage",
  "Business Permits",
];

function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Services");

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      activeCategory === "All Services" ||
      service.group === activeCategory;

    const searchText = searchTerm.toLowerCase().trim();

    const matchesSearch =
      service.title.toLowerCase().includes(searchText) ||
      service.category.toLowerCase().includes(searchText) ||
      service.description.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        {/* Page heading */}
        <div className="services-heading">
          <span className="services-eyebrow">
            <span className="eyebrow-dot"></span>
            YOUR PUBLIC SERVICE DIRECTORY
          </span>

          <h2>
            Browse the service <span>you need.</span>
          </h2>

          <p>
            Report community issues, track your service requests, and help make your neighborhood a better place for everyone.
          </p>
        </div>

        {/* Search and categories */}
        <div className="services-tools">
          <div className="services-search">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search for a service..."
              aria-label="Search public services"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div
            className="services-filters"
            aria-label="Filter services"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-btn ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results heading */}
        <div className="services-results-heading">
          <div>
            <h3>Explore our services</h3>
            <p>
              Find useful information and explore available services.
            </p>
          </div>

          <span className="results-count">
            {filteredServices.length}{" "}
            {filteredServices.length === 1 ? "service" : "services"}
          </span>
        </div>

        {/* Service cards */}
        {filteredServices.length > 0 ? (
          <div className="services-grid">
            {filteredServices.map((service) => (
              <article
                className="service-card"
                key={service.number}
              >
                <div className="service-card-top">
                  <div
                    className={`service-icon ${service.color}`}
                    aria-hidden="true"
                  >
                    {service.icon}
                  </div>

                  <span className="service-number">
                    {service.number}
                  </span>
                </div>

                <span className="service-category">
                  {service.category}
                </span>

                <h3>{service.title}</h3>

                <p className="service-description">
                  {service.description}
                </p>

                <div className="service-info">
                  <span className="info-dot"></span>
                  {service.time}
                </div>

                <div className="service-card-bottom">
                  <Link
                    to={service.link}
                    className="service-link"
                    aria-label={`Explore ${service.title}`}
                  >
                    Submit Service Request <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="services-empty">
            <span className="empty-icon" aria-hidden="true">
              🔎
            </span>

            <h3>No services found</h3>

            <p>
              Try another search term or choose a different category.
            </p>

            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("All Services");
              }}
            >
              View all services
            </button>
          </div>
        )}

        {/* Bottom information */}
        <div className="services-footer">
          <div className="footer-info-icon" aria-hidden="true">
            <span>i</span>
          </div>

          

          <Link to="/track-request" className="all-services-link">
            Track a request <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Services;
