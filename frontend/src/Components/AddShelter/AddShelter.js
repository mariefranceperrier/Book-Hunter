import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddShelter.css';
import { useMapCenter } from '../../MapCenterContext';

const AddShelter = () => {
    const [civicNumber, setCivicNumber] = useState('');
    const [streetName, setStreetName] = useState('');
    const [city, setCity] = useState('');
    const [picture, setPicture] = useState(null);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { setMapCenter } = useMapCenter();

    const validateCivicNumber = (value) => {
        return /^\d+$/.test(value);
    };

    const validateStreetName = (value) => {
         return /^[A-Za-z0-9\s-]+$/.test(value) && value.length <= 50;
    };

    const validateCityName = (value) => {
        return /^[A-Za-z\s]+$/.test(value) && value.length <= 50;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateCivicNumber(civicNumber)) {
            setError('Civic number must be a valid number.');
        } else if (!validateStreetName(streetName)) {
            setError('Street name must contain only letters, numbers, and spaces, and be less than 50 characters.');
        } else if (!validateCityName(city)) {
            setError('City name must contain only letters and spaces, and be less than 50 characters.');
        } else {
            setError('');
            const formData = new FormData();
            formData.append('civic_number', civicNumber);
            formData.append('street_name', streetName);
            formData.append('city', city);
            if (picture) {
                formData.append('picture', picture);
            }

            try {
                const response = await fetch('/api/shelters', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const shelter = await response.json();
                    console.log('Shelter added successfully', shelter);

                    // Extract latitude and longitude
                    const latitude = parseFloat(shelter.latitude);
                    const longitude = parseFloat(shelter.longitude);

                    // Validate the coordinates
                    if (!isNaN(latitude) && !isNaN(longitude)) {
                        const center = { lat: latitude, lng: longitude };
                        setMapCenter(center);
                        navigate('/allshelters', { state: { center } });
                    } else {
                        console.error('Invalid coordinates received from API');
                    }
                } else {
                    console.error('Failed to add shelter');
                }
            } catch (error) {
                console.error('Error:', error);
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
                <button className="add-shelter-button" type="submit">Add Shelter</button>
                <img src="/ShelterImg.jpeg" alt="Image of a book shelter"/>
                
                {/* <video width="100%" height="auto" controls>
                <source src="/HomePageAnimation.mov" type="video/quicktime" />
                Your browser does not support the video tag.
                </video> */}
            </form>
        </>
    );
};

export default AddShelter;