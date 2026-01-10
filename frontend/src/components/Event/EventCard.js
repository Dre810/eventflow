import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  return (
    <div className="card event-card">
      <div className="event-image">
        <img 
          src={event.image || 'https://via.placeholder.com/400x200'} 
          alt={event.title}
        />
        {event.isFeatured && (
          <span className="featured-badge">Featured</span>
        )}
      </div>
      
      <div className="event-content">
        <div className="event-meta">
          <span className={`event-category ${event.category}`}>
            {event.category}
          </span>
          <span className="event-price">
            <FiDollarSign /> {event.price > 0 ? `$${event.price}` : 'Free'}
          </span>
        </div>
        
        <h3 className="event-title">{event.title}</h3>
        <p className="event-description">{event.description.substring(0, 100)}...</p>
        
        <div className="event-details">
          <div className="detail-item">
            <FiCalendar />
            <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="detail-item">
            <FiMapPin />
            <span>{event.location}</span>
          </div>
          <div className="detail-item">
            <FiUsers />
            <span>{event.registeredCount || 0} attending</span>
          </div>
        </div>
        
        <div className="event-actions">
          <Link to={`/events/${event._id}`} className="btn btn-primary">
            View Details
          </Link>
          {event.availableTickets > 0 ? (
            <Link to={`/events/${event._id}/book`} className="btn btn-outline">
              Book Now
            </Link>
          ) : (
            <span className="sold-out">Sold Out</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;