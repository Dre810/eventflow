import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { eventsAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { FiUpload, FiCalendar, FiMapPin, FiDollarSign, FiUsers } from 'react-icons/fi';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required').min(50, 'Description must be at least 50 characters'),
  date: yup.string().required('Date is required'),
  time: yup.string().required('Time is required'),
  location: yup.string().required('Location is required'),
  category: yup.string().required('Category is required'),
  price: yup.number().min(0, 'Price cannot be negative').required('Price is required'),
  availableTickets: yup.number().min(1, 'Must have at least 1 ticket').required('Ticket count is required'),
  image: yup.string().url('Must be a valid URL').required('Image URL is required'),
});

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Combine date and time
      const eventDateTime = `${data.date}T${data.time}:00`;
      
      const eventData = {
        ...data,
        date: eventDateTime,
        price: parseFloat(data.price),
        availableTickets: parseInt(data.availableTickets),
      };

      await eventsAPI.create(eventData);
      
      Swal.fire({
        title: 'Success!',
        text: 'Event created successfully!',
        icon: 'success',
        confirmButtonText: 'Great!'
      }).then(() => {
        navigate('/events');
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to create event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Music',
    'Conference',
    'Workshop',
    'Sports',
    'Art',
    'Food & Drink',
    'Technology',
    'Business',
    'Education',
    'Health & Wellness'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-gray-600">Fill in the details below to create a new event</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="form-group md:col-span-2">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              {...register('title')}
              className={`form-control ${errors.title ? 'border-danger' : ''}`}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-danger text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="form-group md:col-span-2">
            <label className="form-label">Description *</label>
            <textarea
              {...register('description')}
              rows="4"
              className={`form-control ${errors.description ? 'border-danger' : ''}`}
              placeholder="Describe your event in detail"
            />
            {errors.description && (
              <p className="text-danger text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date *</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                {...register('date')}
                className={`form-control pl-10 ${errors.date ? 'border-danger' : ''}`}
              />
            </div>
            {errors.date && (
              <p className="text-danger text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Time */}
          <div className="form-group">
            <label className="form-label">Time *</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="time"
                {...register('time')}
                className={`form-control pl-10 ${errors.time ? 'border-danger' : ''}`}
              />
            </div>
            {errors.time && (
              <p className="text-danger text-sm mt-1">{errors.time.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location *</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                {...register('location')}
                className={`form-control pl-10 ${errors.location ? 'border-danger' : ''}`}
                placeholder="Venue address"
              />
            </div>
            {errors.location && (
              <p className="text-danger text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              {...register('category')}
              className={`form-control ${errors.category ? 'border-danger' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-danger text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price')}
                className={`form-control pl-10 ${errors.price ? 'border-danger' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="text-danger text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* Available Tickets */}
          <div className="form-group">
            <label className="form-label">Available Tickets *</label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                min="1"
                {...register('availableTickets')}
                className={`form-control pl-10 ${errors.availableTickets ? 'border-danger' : ''}`}
                placeholder="Number of tickets"
              />
            </div>
            {errors.availableTickets && (
              <p className="text-danger text-sm mt-1">{errors.availableTickets.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="form-group md:col-span-2">
            <label className="form-label">Event Image URL *</label>
            <div className="relative">
              <FiUpload className="absolute left-3 top-3 text-gray-400" />
              <input
                type="url"
                {...register('image')}
                className={`form-control pl-10 ${errors.image ? 'border-danger' : ''}`}
                placeholder="https://example.com/event-image.jpg"
              />
            </div>
            {errors.image && (
              <p className="text-danger text-sm mt-1">{errors.image.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">Enter a direct link to your event image</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold mb-4">Event Preview</h3>
        <p className="text-gray-600">Your event will appear like this to users</p>
        {/* Add preview component here if needed */}
      </div>
    </div>
  );
};

export default CreateEventPage;