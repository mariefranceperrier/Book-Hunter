import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import  { useShelters } from '../../ShelterContext';
import './AllShelters.css';


const PoiMarkers = ({ pois }) => {
  const map = useMap();

  const handleClick = (ev) => {
    if (!map) return;
    if (!ev.latLng) return;
    console.log('marker clicked:', ev.latLng.toString());
    map.panTo(ev.latLng);
  };

  return (
    <>
      {pois.map((poi) => (
        <Marker
          key={poi.key}
          position={poi.location}
          title={poi.key}
          clickable={true}
          onClick={handleClick}
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
};

const AllShelters = () => {
  const { shelters, fetchShelters } = useShelters();
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 45.4215, lng: -75.6910 });
  const [map, setMap] = useState(null);

  useEffect(() => {
    const fetchInitialLocations = async () => {
      try {
        await fetchShelters();
        const data = shelters.map((shelter, index) => {
          let coords;
          if (typeof shelter.pin_coord === 'string') {
            coords = shelter.pin_coord
              .replace(/[()]/g, '')
              .split(',')
              .map(coord => parseFloat(coord.trim()));
          } else if (Array.isArray(shelter.pin_coord)) {
            coords = shelter.pin_coord;
          } else if (typeof shelter.pin_coord === 'object' && shelter.pin_coord !== null) {
            coords = [shelter.pin_coord.x, shelter.pin_coord.y];
          } else {
            console.error('Unknown format for pin_coord:', shelter.pin_coord);
            return null;
          }

          if (coords.length === 2) {
            return {
              key: `shelterID${index + 1}`,
              location: {
                lat: coords[0],
                lng: coords[1],
              },
            };
          }
          return null;
        }).filter(shelter => shelter !== null);
        setLocations(data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialLocations();
  }, [shelters, fetchShelters]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
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

  const fetchLocations = async () => {
    try {
      let data;
      if (selectedCity) {
        const cityCoordinates = await fetchCityCoordinates(selectedCity);
        if (cityCoordinates) {
          setMapCenter({ lat: cityCoordinates.lat, lng: cityCoordinates.lng });
          if (map) {
            map.panTo({ lat: cityCoordinates.lat, lng: cityCoordinates.lng });
          }
        }
        const response = await axios.get(`/api/shelters?city=${selectedCity}`);
        data = response.data;
      } else {
        const response = await axios.get(`/api/shelters`);
        data = response.data;
      }

      const formattedData = data.map((shelter, index) => {
        let coords;
        if (typeof shelter.pin_coord === 'string') {
          coords = shelter.pin_coord
            .replace(/[()]/g, '') 
            .split(',') 
            .map(coord => parseFloat(coord.trim()));
        } else if (Array.isArray(shelter.pin_coord)) {
          coords = shelter.pin_coord;
        } else if (typeof shelter.pin_coord === 'object' && shelter.pin_coord !== null) {
          coords = [shelter.pin_coord.x, shelter.pin_coord.y];
        } else {
          console.error('Unknown format for pin_coord:', shelter.pin_coord);
          return null;
        }

        if (coords.length === 2) {
          return {
            key: `shelterID${index + 1}`,
            location: {
              lat: coords[0],
              lng: coords[1],
            },
          };
        }
        return null;
      }).filter(shelter => shelter !== null);

      setLocations(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedCity]);
 
  return (
    <div className="all-shelters-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name..."
          value={selectedCity}
          onChange={handleCityChange}
        />
        <button onClick={fetchLocations}>Search</button>
      </div>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
        <Map
          className="map-container"
          defaultZoom={13}
          center={mapCenter}
          mapID='e187bd2cd82b5d4f'
          onLoad={mapInstance => setMap(mapInstance)}
          scrollwheel={true}
        >
          <PoiMarkers pois={locations} />
        </Map>
      </APIProvider>
    </div>
  );
};

export default AllShelters;
