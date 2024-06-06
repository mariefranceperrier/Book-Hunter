import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Marker, APIProvider } from '@vis.gl/react-google-maps';
import './AddBook.css';

const AddBook = () => {
  const [isbn, setIsbn] = useState('');
  const [condition, setCondition] = useState('New');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 45.4215, lng: -75.6910 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShelters = async () => {
      const response = await fetch('/api/shelters');
      if (response.ok) {
        const data = await response.json();
        setShelters(data);
      } else {
        console.error('Failed to fetch shelters');
      }
    };
    fetchShelters();
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // If geolocation is available, set the map center to the user's location
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          // If geolocation is not available, the map center remains the same
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
  };

  return (
    <>
      <h2>Thank you for your donation!</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="isbn">ISBN Number:</label>
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
              className="map-container"
              defaultZoom={13}
              defaultCenter={mapCenter}
              style={{ width: '100%', height: '400px' }}
              scrollwheel={true}
            >
              {shelters.map((shelter, index) => (
                <Marker
                  key={index}
                  position={{ lat: parseFloat(shelter.latitude), lng: parseFloat(shelter.longitude) }}
                  onClick={() => handleMarkerClick(shelter)}
                />
              ))}
            </Map>
          </APIProvider>
          {selectedShelter && (
            <p>Selected Shelter: {selectedShelter.street_name}, {selectedShelter.city}</p>
          )}
        </div>
        <button type="submit">Add Book</button>
      </form>
      {success && <div className="alert alert-success" role="alert">Book added successfully!</div>}
    </>
  );
};

export default AddBook;








