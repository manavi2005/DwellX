
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Account.css';

export default function Account() {
  const [preferences, setPreferences] = useState({
    recreationProximity: '',
    hospitalProximity: '',
    safetyLevel: '',
    schoolRating: '',
    zipcode: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await api.get('/preferences');
        setPreferences(res.data);
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      }
    };
    fetchPreferences();
  }, []);

  const handleChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/preferences', {
        zipcode: preferences.zipcode,
        school: preferences.schoolRating,
        safety_level: preferences.safetyLevel,
        hospital_proximity: preferences.hospitalProximity,
        recreation_proximity: preferences.recreationProximity,
      });
      alert('Preferences saved successfully!');
    } catch (error) {
      alert('Failed to save preferences');
      console.error(error);
    }
  };

    const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      api.delete('/auth/delete')
        .then(() => {
          localStorage.removeItem('dwellx_token');
          navigate('/login');
        })
        .catch(error => {
          console.error('Error deleting account:', error);
        });
    }
  };

  return (
    <div className="account-container">
        <h2 className='h2-welcome'>Welcome!</h2>
        <h3 className='h3-welcome'>Add or update your preferences below to see personal housing recommendations!</h3>
      <form onSubmit={handleSubmit} className="preferences-form">
        <div>
          <label htmlFor="recreationProximity">Recreation Proximity (km)</label>
          <input
            type="number"
            id="recreationProximity"
            name="recreationProximity"
            value={preferences.recreationProximity}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="hospitalProximity">Hospital Proximity (km)</label>
          <input
            type="number"
            id="hospitalProximity"
            name="hospitalProximity"
            value={preferences.hospitalProximity}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="safetyLevel">Safety Level (1-5)</label>
          <input
            type="number"
            id="safetyLevel"
            name="safetyLevel"
            value={preferences.safetyLevel}
            onChange={handleChange}
            min="1"
            max="5"
            required
          />
        </div>

        <div>
          <label htmlFor="schoolRating">School Rating (1-5)</label>
          <input
            type="number"
            id="schoolRating"
            name="schoolRating"
            value={preferences.schoolRating}
            onChange={handleChange}
            min="1"
            max="5"
            required
          />
        </div>

        <div>
          <label htmlFor="zipcode">Zipcode</label>
          <input
            type="text"
            id="zipcode"
            name="zipcode"
            value={preferences.zipcode}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Save Preferences</button>
      </form>
       <div className="delete-account-section">
         <p className="warning-text">Warning: Deleting your account is permanent and cannot be undone.</p>
        <button className="delete-account-button" onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
}