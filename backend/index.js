const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const pool = require('./db/db');
const app = express();
const upload = multer();

app.use(cors());
app.use(bodyParser.json());

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

const createBook = async (isbn, condition) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO books (barcode, condition) VALUES ($1, $2) RETURNING *',
            [isbn, condition]
        );
        return result.rows[0];
    } finally {
        client.release();
    }
};

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

app.post('/api/books', async (req, res) => {
    try {
        const { isbn, condition } = req.body;
        const book = await createBook(isbn, condition);
        res.status(201).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/search', async (req, res) => {
    const { title, author, genre, city } = req.body;

    const query = `
        SELECT b.title, b.author, b.genre, s.city
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
