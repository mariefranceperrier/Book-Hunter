import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { APIProvider, Map, Marker, useMap, InfoWindow } from '@vis.gl/react-google-maps';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllShelters.css';
import { useMapCenter } from '../../MapCenterContext';

const PoiMarkers = ({ pois, onMarkerHover, onMarkerClick }) => {
  const map = useMap();

  const handleMouseOver = (poi) => {
    if (!map) return;
    onMarkerHover(poi);
  };

  return (
    <>
      {pois.map((poi) => (
        <Marker
          key={poi.key}
          position={poi.location}
          title={poi.key}
          clickable={true}
          onMouseOver={() => handleMouseOver(poi)}
          onClick={() => onMarkerClick(poi)}
        />
      ))}
    </>
  );
};

PoiMarkers.propTypes = {
  pois: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    location: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }).isRequired,
  })).isRequired,
  onMarkerHover: PropTypes.func.isRequired,
  onMarkerClick: PropTypes.func.isRequired,
};

const AllShelters = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mapCenter, setMapCenter } = useMapCenter();
  const [shelters, setShelters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(1);
  const [hoveredShelter, setHoveredShelter] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await axios.get('/api/shelters');
        if (response.status === 200) {
          const sheltersData = response.data;

          // Fetch the number of available books for each shelter
          const updatedSheltersData = await Promise.all(sheltersData.map(async (shelter) => {
            const booksResponse = await axios.get(`/api/shelters/${shelter.id}/books`);
            const availableBooks = booksResponse.data.filter(book => book.is_available).length;
            return { ...shelter, available_books: availableBooks };
          }));

          setShelters(updatedSheltersData);
        } else {
          console.error('Failed to fetch shelters');
        }
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };

    fetchShelters();
  }, []);

  useEffect(() => {
    const formatShelters = () => {
      const formattedData = shelters.map((shelter, index) => {
        return {
          key: `shelterID${index + 1}`,
          location: {
            lat: parseFloat(shelter.latitude),
            lng: parseFloat(shelter.longitude),
          },
          ...shelter
        };
      }).filter(shelter => !isNaN(shelter.location.lat) && !isNaN(shelter.location.lng));
      setLocations(formattedData);
      setLoading(false);
    };

    formatShelters();
  }, [shelters]);

  useEffect(() => {
    if (location.state && location.state.center) {
      const center = {
        lat: parseFloat(location.state.center.lat),
        lng: parseFloat(location.state.center.lng),
      };
      if (!isNaN(center.lat) && !isNaN(center.lng)) {
        setMapCenter(center);
      }
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    }
  }, [location.state, setMapCenter]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchLocations(selectedCity);
    }
  };

  const fetchCityCoordinates = async (city) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: city,
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        }
      });
      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return location;
      } else {
        throw new Error(`No results found for city: ${city}`);
      }
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
      return null;
    }
  };

  const fetchLocations = async (city) => {
    try {
      const cityCoordinates = await fetchCityCoordinates(city);
      if (cityCoordinates) {
        setMapCenter({ lat: cityCoordinates.lat, lng: cityCoordinates.lng });
        setMapKey(prevKey => prevKey + 1);
      }

      const response = await axios.get(city ? `/api/shelters?city=${city}` : '/api/shelters');
      const data = response.data;

      const formattedData = data.map((shelter, index) => {
        return {
          key: `shelterID${index + 1}`,
          location: {
            lat: parseFloat(shelter.latitude),
            lng: parseFloat(shelter.longitude),
          },
          ...shelter
        };
      }).filter(shelter => !isNaN(shelter.location.lat) && !isNaN(shelter.location.lng));
      setLocations(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleMarkerClick = (shelter) => {
    navigate(`/shelter/${shelter.id}`, { state: { shelter } });
  };

  const handleInfoWindowClose = () => {
    setHoveredShelter(null);
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
    setMapInstance(map);
  };

  useEffect(() => {
    if (mapInstance && mapCenter) {
      mapInstance.setCenter(mapCenter);
      mapInstance.setZoom(15);
    }
  }, [mapInstance, mapCenter]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!mapCenter || isNaN(mapCenter.lat) || isNaN(mapCenter.lng)) {
    return <div>Invalid map center coordinates</div>;
  }

  return (
    <div className="all-shelters-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name..."
          value={selectedCity}
          onChange={handleCityChange}
          onKeyPress={handleKeyPress}
        />
        <button className="search-container-button" onClick={() => fetchLocations(selectedCity)}>Search</button>
      </div>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <Map
          key={mapKey}
          className="map-container-all"
          defaultZoom={13}
          defaultCenter={mapCenter}
          onLoad={handleMapLoad}
          scrollwheel={true}
          disableDefaultUI={true}
        >
          <PoiMarkers pois={locations} onMarkerHover={setHoveredShelter} onMarkerClick={handleMarkerClick} />
          {hoveredShelter && (
            <InfoWindow
            position={{
              lat: hoveredShelter.location.lat + 0.0005,
              lng: hoveredShelter.location.lng
            }}
            onCloseClick={handleInfoWindowClose}
            headerDisabled
          >
            <div className="info-window">
              <button className="close-button-info" onClick={handleInfoWindowClose}>X</button>
              <p>{hoveredShelter.civic_number} {hoveredShelter.street_name}</p>
              <p>Available Books: {hoveredShelter.available_books}</p>
              {hoveredShelter.picture && (
                <img
                  src={`data:image/jpeg;base64,${hoveredShelter.picture}`}
                  alt="Shelter"
                />
              )}
            </div>
          </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default AllShelters;