import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddBook.css';

const AddBook = () => {
    const [isbn, setIsbn] = useState('');
    const [condition, setCondition] = useState('New');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

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

            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isbn, condition, ...bookDetails }),
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
                <button type="submit">Add Book</button>
            </form>
            {success && <div className="alert alert-success" role="alert">Book added successfully!</div>}
        </>
    );
};

export default AddBook;
