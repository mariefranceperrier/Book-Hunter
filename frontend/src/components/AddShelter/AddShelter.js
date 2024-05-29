import React, { useState } from 'react';
import './AddShelter.css';

const AddShelter = () => {
    const [civicNumber, setCivicNumber] = useState('');
    const [streetName, setStreetName] = useState('');
    const [city, setCity] = useState('');
    const [picture, setPicture] = useState(null);
    const [error, setError] = useState('');

    const validateCivicNumber = (value) => {
      return /^\d+$/.test(value);
  };

  const validateStreetName = (value) => {
      return /^[A-Za-z0-9\s]+$/.test(value) && value.length <= 50;
  };

  const validateCityName = (value) => {
      return /^[A-Za-z\s]+$/.test(value) && value.length <= 50;
  };

  const handleSubmit = (event) => {
      event.preventDefault();
      if (!validateCivicNumber(civicNumber)) {
          setError('Civic number must be a valid number.');
      } else if (!validateStreetName(streetName)) {
          setError('Street name must contain only letters, numbers, and spaces, and be less than 50 characters.');
      } else if (!validateCityName(city)) {
          setError('City name must contain only letters and spaces, and be less than 50 characters.');
      } else {
          setError('');
          // Handle form submission logic
          const formData = new FormData();
          formData.append('civicNumber', civicNumber);
          formData.append('streetName', streetName);
          formData.append('city', city);
          if (picture) {
              formData.append('picture', picture);
          }

          // logging formData entries for now
          for (let entry of formData.entries()) {
              console.log(entry[0] + ': ' + entry[1]);
          }
      }
  };

  const handleFileChange = (event) => {
      setPicture(event.target.files[0]);
  };

  return (
    <>
      <h2>Add a new book shelter location</h2>
      <form onSubmit={handleSubmit}>
          <div>
              <label htmlFor="civicNumber">Civic Number:</label>
              <input
                  type="text"
                  id="civicNumber"
                  value={civicNumber}
                  onChange={(e) => setCivicNumber(e.target.value)}
                  required
              />
          </div>
          <div>
              <label htmlFor="streetName">Street Name:</label>
              <input
                  type="text"
                  id="streetName"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  required
              />
          </div>
          <div>
              <label htmlFor="city">City:</label>
              <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
              />
          </div>
          <div>
              <label htmlFor="picture">Upload Picture:</label>
              <input
                  type="file"
                  id="picture"
                  accept="image/*"
                  onChange={handleFileChange}
              />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Add Shelter</button>
      </form>
      </>
  );
};

export default AddShelter;
