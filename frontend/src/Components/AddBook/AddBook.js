import React, { useState } from 'react';
import './AddBook.css';

const AddBook = () => {
    const [isbn, setIsbn] = useState('');
    const [condition, setCondition] = useState('New');
    const [error, setError] = useState('');

    const handleIsbnChange = (e) => {
        const value = e.target.value;
        // Only allow numeric input
        if (/^\d*$/.test(value)) {
            setIsbn(value);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (isbn.length !== 10 && isbn.length !== 13) {
            setError('ISBN must be either 10 or 13 digits long.');
        } else {
            setError('');
            // Handle form submission logic
            console.log({ isbn, condition });
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
                    onChange={handleIsbnChange}
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
        </>
    );
};

export default AddBook;