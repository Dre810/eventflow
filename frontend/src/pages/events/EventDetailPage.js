import React from 'react';
import { useParams } from 'react-router-dom';

const EventDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1>Event Details</h1>
      <p>Event ID: {id}</p>
      {/* Add event details here */}
    </div>
  );
};

export default EventDetailPage;