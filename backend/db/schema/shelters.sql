CREATE EXTENSION IF NOT EXISTS postgis;
DROP TABLE IF EXISTS shelters CASCADE;
CREATE TABLE shelters (
    id SERIAL PRIMARY KEY,
    civic_number INTEGER NOT NULL,
    street_name VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    pin_coord GEOMETRY(Point, 4326),
    picture BYTEA
);