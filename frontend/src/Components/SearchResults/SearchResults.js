import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SearchResults.css';

//if we were simply displaying the results, we could use the following code:
//this info will probably serve as inspiration for the Google API pins

const SearchResults = () => {
  const location = useLocation();
  const { results } = location.state;
  const [booksWithImages, setBooksWithImages] = useState([]);
  const navigate = useNavigate();

  const handleViewShelter = (shelterId) => {
    navigate(`/shelter/${shelterId}`);
  };

  useEffect(() => {
    const fetchBookImages = async () => {
      const apiKey = process.env.REACT_APP_BOOK_API_KEY;
      const booksWithImages = await Promise.all(results.map(async (result) => {
        if (result.barcode) {
          const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${result.barcode}&key=${apiKey}`);
          const data = await response.json();
          if (data.totalItems > 0 && data.items[0].volumeInfo) {
            const book = data.items[0].volumeInfo;
            return {
              ...result,
              imageUrl: book.imageLinks ? book.imageLinks.thumbnail : 'https://via.placeholder.com/128x192.png?text=No+Image'
            };
          }
        }
        return {
          ...result,
          imageUrl: 'https://via.placeholder.com/128x192.png?text=No+Image'
        };
      }));
      setBooksWithImages(booksWithImages);
    };

    fetchBookImages();
  }, [results]);

  return (
    <main className="search-results">
      <h1>Search Results</h1>
      {booksWithImages.map((result, index) => (
        <div key={index} className="result">
          <h2>{result.title}</h2>
          <img src={result.imageUrl} alt={`${result.title} cover`} />
          <p>Author: {result.author}</p>
          <p>Genre: {result.genre}</p>
          <h3>Location</h3>
          <p>City: {result.city}</p>
          <button className="view-shelter-btn" onClick={ () => handleViewShelter(result.shelter_id)}>View Shelter</button>
        </div>
      ))}
    </main>
  );
}

export default SearchResults;