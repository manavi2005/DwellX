import React, { useState, useEffect } from 'react';
import './Popular.css';
import axios from 'axios';

const Popular = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchPopularHouses() {
      try {
        const response = await axios.get('http://localhost:3007/api/houses/popular', {
          withCredentials: true,
        });
        const houses = response.data;

        console.log('Popular houses from backend:', houses);

        const formattedResults = houses.map((house) => ({
          id: house.housing_id, 
          neighborhood: house.property_name || 'Unknown Property',
          school: Math.round(house.avg_school_rating || 0),
          description: house.address || 'No address available',
          crime: Math.round(house.nearby_crime_count || 0), 
          hospital: house.nearby_hospital_count || 0
        }));

        setResults(formattedResults);
      } catch (error) {
        console.error('Error fetching popular houses:', error);
      }
    }

    fetchPopularHouses();
  }, []);

  return (
    <div className="generate-page">
      <h1 className="generate-title">Popular Housing Matches</h1>
      <div className="cards-container">
        {results.length === 0 ? (
          <p>Loading houses...</p>
        ) : (
          results.map((result) => (
            <div key={result.id} className="result-card">
              <h2 className="neighborhood-name">{result.neighborhood}</h2>
              <p className="description">{result.description}</p>
              <p className="score">School Rating: {result.school}</p>
              <p className="score">Crime Level: {result.crime}</p>
              <p className="score">Hospitals Nearby: {result.hospital}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Popular;
