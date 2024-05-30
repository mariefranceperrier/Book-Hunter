DROP TABLE IF EXISTS books CASCADE;
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    shelter_id INTEGER REFERENCES shelters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    barcode VARCHAR(50) UNIQUE,
    condition VARCHAR(50) CHECK (condition IN ('New', 'Lightly Used', 'Well Used', 'Rough')),
    is_available BOOLEAN DEFAULT TRUE
);