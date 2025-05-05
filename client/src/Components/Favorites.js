import React, { useState, useEffect } from 'react';
import './Favorites.css';
import axios from 'axios';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await axios.get('http://localhost:3007/api/favorites', {
          withCredentials: true,
        });
        const favoritesData = response.data.map((fav, index) => ({
          id: index, // not ideal but needed for React key
          neighborhood: fav.neighborhood_name,
          zipcode: fav.zipcode,
        }));
        setFavorites(favoritesData);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    }

    fetchFavorites();
  }, []);

  const removeFavorite = async (neighborhoodName, zipcode) => {
    try {
      const response = await axios.delete('http://localhost:3007/api/favorites', {
        withCredentials: true,
        data: { neighborhoodName, zipcode },
      });

      if (response.status === 200) {
        setFavorites((prev) =>
          prev.filter((fav) => fav.neighborhood !== neighborhoodName)
        );
      } else {
        console.error('Failed to remove favorite');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">Your Favorite Neighborhoods</h1>
      <div className="cards-container-favorites">
        {favorites.length === 0 ? (
          <p>No favorites yet.</p>
        ) : (
          favorites.map((favorite) => (
            <div key={favorite.id} className="result-card">
              <h2 className="neighborhood-name">{favorite.neighborhood}</h2>
              <p className="description">Zipcode: {favorite.zipcode}</p>
              <button
                className="remove-favorite-btn"
                onClick={() => removeFavorite(favorite.neighborhood, favorite.zipcode)}
              >
                Remove from Favorites
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Favorites;
