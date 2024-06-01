import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Book = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/books/${bookId}`);
        if (response.ok) {
          const data = await response.json();
          const googleBooksResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${data.barcode}&key=${process.env.REACT_APP_BOOK_API_KEY}`
          );
          const googleBooksData = await googleBooksResponse.json();
          const imageUrl = googleBooksData.items[0]?.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/128x195.png?text=No+Image+Available";
          setBook({ ...data, imageUrl });
        } else {
          setError('Failed to fetch book details.');
        }
      } catch (error) {
        console.error(error);
        setError('An error occurred while fetching book details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/books/${bookId}/toggle`, {
        method: 'POST'
      });
      if (response.ok) {
        const updatedBook = await response.json();
        setBook(updatedBook);
      } else {
        setError('Failed to update book availability.');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while updating book availability.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <main className="book-details">
      <button onClick={toggleAvailability}>
        {book.is_available ? 'Gotcha!' : 'Check In'}
      </button>
      <div className="book-info">
        <h2>{book.title}</h2>        
        <img src={book.imageUrl} alt={book.title} />
        <p>Author: {book.author}</p>
        <p>Genre: {book.genre}</p>
        <p>Condition: {book.condition}</p>
      </div>
    </main>
  );
};

export default Book;


