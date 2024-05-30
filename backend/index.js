const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const upload = multer();

app.use(bodyParser.json());

app.post('/api/shelters', upload.single('picture'), async (req, res) => {
    try {
        const { civicNumber, streetName, city } = req.body;
        const picture = req.file ? req.file.buffer : null;
        const shelter = await createShelter(civicNumber, streetName, city, picture);
        res.status(201).json(shelter);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const { shelterId, title, author, genre, barcode, condition, isAvailable } = req.body;
        const book = await createBook(shelterId, title, author, genre, barcode, condition, isAvailable);
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});