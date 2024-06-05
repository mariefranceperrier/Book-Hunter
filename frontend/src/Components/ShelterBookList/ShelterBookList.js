import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ShelterBookList.css';

const ShelterBookList = () => {
  const { id } = useParams();
  const location = useLocation();
  const [shelterDetails, setShelterDetails] = useState(null); 
  const [books, setBooks] = useState([]);
  const [imagesFetched, setImagesFetched] = useState(false);

  
 useEffect(() => {
    const fetchShelterDetails = async () => {
      try {
        const response = await axios.get(`/api/shelters/${id}/details`);
        setShelterDetails(response.data); 
      } catch (error) {
        console.error('Error fetching shelter details:', error);
      }
    };

    fetchShelterDetails();
  }, [id]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`/api/shelters/${id}/books`);
        setBooks(response.data);
        setImagesFetched(false);
      } catch (error) {
        console.error('Error fetching shelter books:', error);
      }
    };

    fetchBooks();
  }, [id]);

  useEffect(() => {
    const fetchBookImage = async (barcode) => {
      try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${barcode}&key=${process.env.REACT_APP_BOOK_API_KEY}`);
        if (response.data.totalItems > 0) {
          const book = response.data.items[0].volumeInfo;
          return book.imageLinks ? book.imageLinks.thumbnail : 'https://via.placeholder.com/128x192?text=No+Image';
        }
      } catch (error) {
        console.error('Error fetching book image:', error);
      }
      return 'https://via.placeholder.com/128x192?text=No+Image';
    };

    const fetchAllBookImages = async () => {
      const updatedBooks = await Promise.all(
        books.map(async (book) => {
          const imageUrl = await fetchBookImage(book.barcode);
          return { ...book, imageUrl };
        })
      );
      setBooks(updatedBooks);
      setImagesFetched(true);
    };

    if (books.length > 0 && !imagesFetched) {
      fetchAllBookImages();
    }
  }, [books, imagesFetched]);

  
  return (
    <main className="shelter-books">
      <h1>Books in this Shelter</h1>
      {shelterDetails && (
        <div className="shelter-details">
          <p><strong>Address:</strong> {shelterDetails.civic_number} {shelterDetails.street_name}, {shelterDetails.city}</p>
        </div>
      )}
      <div className="book-list">
        {books.map((book, index) => (
          <Link to={`/books/${book.id}`} key={index} className="book-link">
            <div className="book">
              <h2>{book.title}</h2>
              <img src={book.imageUrl} alt={book.title} />
              <p>Author: {book.author}</p>
              <p>Genre: {book.genre}</p>
              <p>Condition: {book.condition}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default ShelterBookList;




