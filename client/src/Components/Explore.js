import React, { useState } from 'react';
import './Explore.css';

const Explore = () => {
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [results, setResults]            = useState([]);
  const [loading, setLoading]            = useState(false);

  const queries = [
    { id: 1, label: "Best neighborhoods for families" },
    { id: 2, label: "Housing units near crime hotspots" },
    { id: 3, label: "Top 15 housing communities by school rating" },
    { id: 4, label: "Area-wise aggregate insights" },
    { id: 5, label: "Housing units near parks and hospitals" },
    { id: 6, label: "Search housing by ZIP code" },   // ← new
  ];

  const handleQuerySelect = async (queryId) => {
    setSelectedQuery(queryId);
    setLoading(true);

    let url;
    if (queryId === 6) {
      const zip = prompt("Enter a ZIP code to search:");
      if (!zip) {
        setLoading(false);
        return;
      }
      url = `http://localhost:3007/api/houses/${zip}`;
    } else {
      url = `http://localhost:3007/api/query${queryId}`;
    }

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // normalize the keys for display per query
  const formatResults = (queryId, data) => {
    switch (queryId) {
      case 1: // Housing units near parks and hospitals --done
        return data.map(item => ({
          Address: item.housing_address,
          'Property Type': item['Property Type'],
          Zipcode: item['Zip Code'],
          'Distance From Hospital': `${(Number(item.min_distance) || 0).toFixed(2)} km`,
        }));
      case 2: 
        return data.map(item => ({ // Crimes --done
            Zipcode: item['Zip Code'],
            'Property Type': item['Property Type'],
            // Zipcode: item['Zip Code'],
            'Total Crimes': item.total_crimes,
            'Avg Crimes per Month': item.avg_crimes_per_month,
        }));
      case 3: // Top 15 housing communities by school rating  --done
        return data.map(item => ({
          Community: item.community_name,
          Zipcode: item.zip_code,
          'Number of Schools': item.school_count,
          'Average School Rating': (item.total_score / 10).toFixed(1),
          'Average Distance From School': `${(Number(item.avg_distance) || 0).toFixed(2)} km`,
        }));
      case 4: // Best Neighborhoods for families
        return data.map(item => ({
          'Property Name': item['Property Name'],
          'Address': item.address,
            'Avg School Rating': item.avg_school_rating,
          'Nearby Crime Count': item.nearby_crime_count,
          'Nearby Hospital Count': item.nearby_hospital_count,
        }));
      case 5: 
        return data.map(item => ({ // Area-wise Aggr --done
            ZipCode: item['Zip Code'],
            'Number of Parks': item.num_parks,
            'Number of Schools': item.num_schools,
            'Number of Hospitals': item.num_hospitals,
        }));
      case 6: // ← our new ZIP fetch
        return data.map(item => ({
          "Property Name": item.property_name,
          Address: item.address,
          Units: item.units,
        }));
      default:
        return data;
    }
  };

  return (
    <div className="explore-page">
      <h1 className="explore-title">Explore Housing Insights</h1>

      {!selectedQuery ? (
        <div className="query-options">
          <h2 className="explore-subtitle">
            Which insights would you like to explore today?
          </h2>
          <div className="query-buttons">
            {queries.map(q => (
              <button
                key={q.id}
                className="query-btn"
                onClick={() => handleQuerySelect(q.id)}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="results-section">
          <h2 className="results-title">Results</h2>
          {loading
            ? <p>Loading…</p>
            : results.length > 0
              ? (
                <div className="cards-container-explore">
                  {formatResults(selectedQuery, results).map((row, i) => (
                    <div key={i} className="result-card">
                      {Object.entries(row).map(([k, v]) => (
                        <p key={k}>
                          <strong>{k}:</strong> {v}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )
              : <p>No results found.</p>
          }
          <button
            className="back-btn"
            onClick={() => {
              setSelectedQuery(null);
              setResults([]);
            }}
          >
            ← Back to options
          </button>
        </div>
      )}
    </div>
  );
};

export default Explore;
