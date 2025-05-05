
import React, { useState } from 'react';
import './QueryButtons.css';
import Navbar from './Navbar';

const QueryButtons = () => {
  const [results, setResults] = useState([]);

  const handleQueryClick = async (queryNumber) => {
    try {
      const response = await fetch(`http://localhost:3007/api/query${queryNumber}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(`Error fetching Query ${queryNumber}:`, error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="query-buttons-container">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            className="nav-link query-button"
            onClick={() => handleQueryClick(num)}
          >
            Query {num}
          </button>
        ))}
      </div>

      <div className="query-results">
        <h3>Results:</h3>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    </div>
  );
};

export default QueryButtons;
