import React, { useState, useEffect } from 'react';
import './Generate.css';
import axios from 'axios';

const Generate = () => {
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const matchesResponse = await axios.get('http://localhost:3007/api/houses/match', {
          withCredentials: true,
        });

        console.log('matchesResponse.data:', matchesResponse.data);

        const hospitalCrimeResults = matchesResponse.data[0]; // First SELECT
        const parkSchoolResults = matchesResponse.data[1];    // Second SELECT

        const parkSchoolMap = {};
        parkSchoolResults.forEach((item) => {
          parkSchoolMap[item.index] = {
            min_park_distance: item.min_park_distance,
            min_school_distance: item.min_school_distance
          };
        });

        const formattedResults = hospitalCrimeResults.map((house, idx) => {
          const parkSchoolInfo = parkSchoolMap[house.index] || {};

          return {
            id: house.index || idx, // fallback to idx if no index
            neighborhood: house['Community Area Name'] || house.community_area_name || 'Unknown Neighborhood',
            zipcode: house['Zip Code'] || house.zip_code || '',
            description: house['Address'] || house.address || 'No description available',
            crime: house.crime_count !== undefined && house.crime_count !== null
              ? Math.round(house.crime_count)
              : '-',
            hospital: house.min_hospital_distance !== undefined && house.min_hospital_distance !== null
              ? (Number(house.min_hospital_distance)/1000).toFixed(2)
              : '-',
            park: parkSchoolInfo.min_park_distance !== undefined && parkSchoolInfo.min_park_distance !== null
              ? Number(parkSchoolInfo.min_park_distance).toFixed(2)
              : '-',
            school: parkSchoolInfo.min_school_distance !== undefined && parkSchoolInfo.min_school_distance !== null
              ? Number(parkSchoolInfo.min_school_distance).toFixed(2)
              : '-'
          };
        });

        setResults(formattedResults);

        // Fetch user's favorites
        const favoritesResponse = await axios.get('http://localhost:3007/api/favorites', {
          withCredentials: true,
        });

        const favoriteNeighborhoods = favoritesResponse.data.map((fav) => fav.neighborhood_name);
        setFavorites(favoriteNeighborhoods);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  // Add to favorites
  const addToFavorites = async (neighborhoodName, zipcode) => {
    try {
      const response = await fetch('http://localhost:3007/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ neighborhoodName, zipcode }),
      });

      if (response.ok) {
        alert('Added to favorites!');
        setFavorites((prev) => [...prev, neighborhoodName]);
      } else {
        alert('Failed to add to favorites.');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Error adding to favorites.');
    }
  };

  return (
    <div className="generate-page">
      <h1 className="generate-title">Your Top Matches</h1>
      <div className="cards-container">
        {results.length === 0 ? (
          <p>Loading matches...</p>
        ) : (
          results.map((result, idx) => (
            <div key={`${result.id}-${idx}`} className="result-card">
              <h2 className="neighborhood-name">{result.neighborhood}</h2>
              <p className="score">Zip Code: {result.zipcode}</p>
              <p className="description">{result.description}</p>

              <button
                className="view-details-btn"
                onClick={() => {
                  setSelectedResult(result);
                  setShowPopup(true);
                }}
              >
                View Details
              </button>

              <button
                className="add-favorite-btn"
                onClick={() => addToFavorites(result.neighborhood, result.zipcode)}
                disabled={favorites.includes(result.neighborhood)}
              >
                {favorites.includes(result.neighborhood) ? 'Favorite' : 'Favorite'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Popup */}
      {showPopup && selectedResult && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>{selectedResult.neighborhood} Details</h2>
            <p><strong>Crime Level:</strong> {selectedResult.crime}</p>
            <p><strong>Hospital Proximity (km):</strong> {selectedResult.hospital}</p>
            <p><strong>Park Proximity (km):</strong> {selectedResult.park}</p>
            <p><strong>School Proximity (km):</strong> {selectedResult.school}</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generate;
