const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db');
const axios = require('axios');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const upload = multer();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Utility function to get geocode for an address
const getGeocode = async (address) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
            }
        });
        if (response.data.results && response.data.results.length > 0) {
            return response.data.results[0].geometry.location;
        }
        throw new Error('No results found');
    } catch (error) {
        console.error('Error fetching geocode:', error);
        throw error;
    }
};


// Function to create a new shelter with coordinates
const createShelter = async (civicNumber, streetName, city, pinCoord, picture) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO shelters (civic_number, street_name, city, pin_coord, picture) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [civicNumber, streetName, city, pinCoord, picture]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};


// Endpoint to get shelters
app.get('/api/shelters', async (req, res) => {
  try {
    const { city } = req.query;
    let query = 'SELECT * FROM shelters';
    let values = [];
    if (city) {
      query += ' WHERE city ILIKE $1';
      values.push(`%${city}%`);
    }

    const shelters = await pool.query(query, values);
    res.json(shelters.rows);
  } catch (error) {
    console.error('Error fetching shelter data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to create a new shelter
app.post('/api/shelters', upload.single('picture'), async (req, res) => {
  try {
    const { civic_number, street_name, city } = req.body;
    const picture = req.file ? req.file.buffer : null;
    const address = `${civic_number} ${street_name}, ${city}`;
    const geocode = await getGeocode(address);
    const pinCoord = `(${geocode.lat}, ${geocode.lng})`;
    const shelter = await createShelter(civic_number, street_name, city, pinCoord, picture);
    res.status(201).json(shelter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// Book-related endpoints and functions
const getBookById = async (id) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM books WHERE id = $1', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  };
  
  const toggleBookAvailability = async (id) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE books SET is_available = NOT is_available WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  };
  
  app.get('/api/books/:id', async (req, res) => {
    try {
      const book = await getBookById(req.params.id);
      res.json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch book details.' });
    }
  });
  
  app.post('/api/books/:id/toggle', async (req, res) => {
    try {
      const book = await toggleBookAvailability(req.params.id);
      res.json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update book availability.' });
    }
  });


// Function to create a new book
const createBook = async (barcode, condition, title, author, genre) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO books (barcode, condition, title, author, genre) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [barcode, condition, title, author, genre]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating book:', error);
        throw error;
    } finally {
        client.release();
    }
};


// Endpoint to create a new book
app.post('/api/books', async (req, res) => {
    try {
        const { isbn: barcode, condition, title, author, genre} = req.body;
        const book = await createBook(barcode, condition, title, author, genre);
        res.status(201).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to search for books
app.post('/api/search', async (req, res) => {
    const { title, author, genre, city } = req.body;

    const query = `
        SELECT b.title, b.author, b.genre, b.barcode, b.shelter_id, s.city
        FROM books b
        JOIN shelters s ON b.shelter_id = s.id
        WHERE 
            (b.title ILIKE $1 OR $1 = '') AND
            (b.author ILIKE $2 OR $2 = '') AND
            (b.genre ILIKE $3 OR $3 = '') AND
            (s.city ILIKE $4 OR $4 = '')
    `;

    const values = [
        `%${title || ''}%`,
        `%${author || ''}%`,
        `%${genre || ''}%`,
        `%${city || ''}%`
    ];

    try {
        const results = await pool.query(query, values);
        if (results.rows.length > 0) {
            res.json({ found: true, results: results.rows });
        } else {
            res.json({ found: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});


// Endpoint to get books for a specific shelter
app.get('/api/shelters/:id/books', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM books WHERE shelter_id = $1', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching shelter books:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
