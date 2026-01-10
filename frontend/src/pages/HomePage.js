import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/Event/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiSearch, FiFilter, FiCalendar, FiTrendingUp, FiShield, FiClock } from 'react-icons/fi';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const { data, isLoading } = useEvents({
    search: searchTerm || undefined,
    category: category || undefined,
    limit: 6,
  });

  const featuredEvents = data?.data?.filter(event => event.isFeatured) || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Amazing Events
              <span className="highlight">Near You</span>
            </h1>
            <p className="hero-description">
              Find, book, and manage events all in one place. From concerts to conferences, 
              we've got something for everyone.
            </p>
            
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search events, categories, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-button">Search</button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <FiCalendar />
                <div>
                  <h4>500+</h4>
                  <p>Events Monthly</p>
                </div>
              </div>
              <div className="stat">
                <FiTrendingUp />
                <div>
                  <h4>98%</h4>
                  <p>Customer Satisfaction</p>
                </div>
              </div>
              <div className="stat">
                <FiShield />
                <div>
                  <h4>100%</h4>
                  <p>Secure Payments</p>
                </div>
              </div>
              <div className="stat">
                <FiClock />
                <div>
                  <h4>24/7</h4>
                  <p>Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Events</h2>
            <Link to="/events" className="btn btn-outline">View All Events</Link>
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="text-center mb-8">Browse By Category</h2>
          <div className="categories-grid">
            {['Music', 'Conference', 'Workshop', 'Sports', 'Art', 'Food & Drink'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? '' : cat)}
                className={`category-chip ${category === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container text-center">
          <h2>Ready to Experience Amazing Events?</h2>
          <p className="mb-8">Join thousands of happy attendees</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events" className="btn btn-primary">Browse Events</Link>
            <Link to="/register" className="btn btn-outline">Create Account</Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
          color: white;
          padding: 80px 0;
          border-radius: 0 0 40px 40px;
          margin-bottom: 60px;
        }
        
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        
        .hero-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
        }
        
        .highlight {
          display: block;
          color: #4cc9f0;
        }
        
        .hero-description {
          font-size: 18px;
          margin-bottom: 40px;
          opacity: 0.9;
        }
        
        .search-box {
          background: white;
          border-radius: 50px;
          padding: 8px;
          display: flex;
          align-items: center;
          margin-bottom: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .search-icon {
          margin-left: 20px;
          color: #6c757d;
        }
        
        .search-input {
          flex: 1