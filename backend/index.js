const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const pool = require('./db/db');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const upload = multer();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

const createShelter = async (civicNumber, streetName, city, picture) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO shelters (civic_number, street_name, city, pin_coord, picture) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [civicNumber, streetName, city, null, picture]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};

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

app.post('/api/shelters', upload.single('picture'), async (req, res) => {
    try {
        const { civic_number, street_name, city } = req.body;
        const picture = req.file ? req.file.buffer : null;
        const shelter = await createShelter(civic_number, street_name, city, picture);
        res.status(201).json(shelter);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

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

app.post('/api/search', async (req, res) => {
    const { title, author, genre, city } = req.body;

    const query = `
        SELECT b.title, b.author, b.genre, b.barcode, s.city
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

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
