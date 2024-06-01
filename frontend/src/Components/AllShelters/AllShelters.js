import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import './AllShelters.css';


const PoiMarkers = ({ pois }) => {
  const map = useMap();

  const handleClick = useCallback((ev) => {
    if (!map) return;
    if (!ev.latLng) return;
    console.log('marker clicked:', ev.latLng.toString());
    map.panTo(ev.latLng);
  }, [map]);

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
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/shelters');
          console.log('Response data :', response.data);

        const data = response.data.map((shelter, index) => {
          console.log('Pin coord:', shelter.pin_coord, typeof shelter.pin_coord);

          let coords;
          if (typeof shelter.pin_coord === 'string') {
            coords = shelter.pin_coord
              .replace(/[()]/g, '') // Remove parentheses
              .split(',') // Split by comma
              .map(coord => parseFloat(coord.trim())); // Convert to float and trim whitespace
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

        console.log('Fetched data:', data);
        setLocations(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchLocations();
  }, []);     
          
        
  const handleMapClick = useCallback((ev) => {
    if (!ev.latLng) return;
    const newLocation = {
      key: `location-${locations.length + 1}`,
      location: { lat: ev.latLng.lat(), lng: ev.latLng.lng() }
    };
    setLocations([...locations, newLocation]);
  }, [locations]);

  return (
    <div className="all-shelters-container">
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
        <Map
          className="map-container"
          defaultZoom={13}
          defaultCenter={{ lat: 45.4215, lng: -75.6910 }}
          mapID='e187bd2cd82b5d4f'
          onClick={handleMapClick}
        >
          <PoiMarkers pois={locations} />
        </Map>
      </APIProvider>
    </div>
  );
};

export default AllShelters;
