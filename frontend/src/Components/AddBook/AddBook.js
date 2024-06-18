import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Marker, InfoWindow, APIProvider } from '@vis.gl/react-google-maps';
import './AddBook.css';

const AddBook = () => {
  const [isbn, setIsbn] = useState('');
  const [condition, setCondition] = useState('New');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [hoveredShelter, setHoveredShelter] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 45.4215, lng: -75.6910 });
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch('/api/shelters');
        if (response.ok) {
          const data = await response.json();
          setShelters(data);
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
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    }
  }, []);

  const fetchBookDetails = async (isbn) => {
    const apiKey = process.env.REACT_APP_BOOK_API_KEY;
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      if (data.totalItems > 0) {
        const book = data.items[0].volumeInfo;
        return {
          title: book.title,
          author: book.authors ? book.authors.join(', ') : 'Unknown Author',
          genre: book.categories ? book.categories.join(', ') : 'Unknown Genre',
        };
      }
    }
    return null;
  };

  const sanitize = (text) => {
    return text.replace(/'/g, '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isbn.length !== 10 && isbn.length !== 13) {
      setError('ISBN must be either 10 or 13 digits long.');
    } else {
      setError('');
      const bookDetails = await fetchBookDetails(isbn);
      if (!bookDetails) {
        setError('Book details not found. Please check the ISBN.');
        return;
      }

      if (!selectedShelter) {
        setError('Please select a shelter location.');
        return;
      }

      const sanitizedDetails = {
        title: sanitize(bookDetails.title),
        author: sanitize(bookDetails.author),
        genre: sanitize(bookDetails.genre),
      };

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isbn,
          condition,
          ...sanitizedDetails,
          shelter_id: selectedShelter.id,
        }),
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        console.error('Failed to add book');
      }
    }
  };

  const handleMarkerClick = (shelter) => {
    setSelectedShelter(shelter);
    setHoveredShelter(null); 
  };

  const handleMarkerHover = (shelter) => {
    setHoveredShelter(shelter);
  };

  const handleInfoWindowClose = () => {
    setHoveredShelter(null);
  };

  const formatShelters = (shelters) => {
    return shelters.map((shelter, index) => {
      return {
        key: `shelterID${index + 1}`,
        location: {
          lat: parseFloat(shelter.latitude),
          lng: parseFloat(shelter.longitude),
        },
        ...shelter
      };
    }).filter(shelter => !isNaN(shelter.location.lat) && !isNaN(shelter.location.lng));
  };

  const formattedShelters = formatShelters(shelters);

  console.log('Formatted shelters:', formattedShelters);

  return (
    <>
      <h2>Thank you for your donation!</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="isbn">ISBN:</label>
          <input
            type="text"
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
        </div>
        <div>
          <label htmlFor="condition">Condition:</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          >
            <option value="New">New</option>
            <option value="Lightly Used">Lightly Used</option>
            <option value="Well Used">Well Used</option>
            <option value="Rough">Rough</option>
          </select>
        </div>
        <div>
          <label htmlFor="shelter">Select Shelter Location:</label>
          <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <Map
              className="map-container-add-book"
              defaultZoom={13}
              defaultCenter={mapCenter}
              onLoad={(mapInstance) => {
                mapRef.current = mapInstance;
              }}
              scrollwheel={true}
              disableDefaultUI={true}
            >
              {formattedShelters.map((shelter) => (
                <Marker
                  key={shelter.key}
                  position={shelter.location}
                  onClick={() => handleMarkerClick(shelter)}
                  onMouseOver={() => handleMarkerHover(shelter)}
                />
              ))}
              {hoveredShelter && (
                <InfoWindow 
                  position={{
                    lat: hoveredShelter.location.lat + 0.0005,
                    lng: hoveredShelter.location.lng
                  }}
                  onCloseClick={handleInfoWindowClose}
                >
                  <div className="custom-info-window">
                    <p>{hoveredShelter.civic_number} {hoveredShelter.street_name}, {hoveredShelter.city}</p>
                    <button
                      className="info-window-button"
                      onClick={() => handleMarkerClick(hoveredShelter)}
                    >
                      Select Shelter
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
          {selectedShelter && (
            <p>Selected Shelter: {selectedShelter.civic_number} {selectedShelter.street_name}, {selectedShelter.city}</p>
          )}
        </div>
        <button className="add-book-button" type="submit">Add Book</button>
      </form>
      {success && <div className="alert alert-success" role="alert">Book added successfully!</div>}
    </>
  );
};

export default AddBook;