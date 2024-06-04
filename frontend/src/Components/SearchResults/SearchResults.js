import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import './SearchResults.css';


const SearchResults = () => {
  const location = useLocation();
  const { results } = location.state;
  const navigate = useNavigate();

  const handleViewShelter = (shelterId) => {
    navigate(`/shelter/${shelterId}`);
  };

  return (
    <main className="search-results">
      <h1>Search Results</h1>
      <div className="map-container">
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <Map
            className="map"
            defaultZoom={10}
            center={{ lat: 0, lng: 0 }} // Initial center, will be updated dynamically
          >
            {results.map((result, index) => (
              <Marker
                key={index}
                position={{ lat: result.latitude, lng: result.longitude }}
                onClick={() => handleViewShelter(result.shelter_id)}
              />
            ))}
          </Map>
        </APIProvider>
      </div>
      {results.map((result, index) => (
        <div key={index} className="result">
          {/* Render book information */}
          <button className="view-shelter-btn" onClick={() => handleViewShelter(result.shelter_id)}>View Shelter</button>
        </div>
      ))}
    </main>
  );
}

export default SearchResults;