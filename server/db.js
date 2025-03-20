const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_reservation_planner');

// Drop and create tables
const createTables = async() => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;

    CREATE TABLE customers(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE restaurants(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE reservations(
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      customer_id INTEGER REFERENCES customers(id) NOT NULL,
      restaurant_id INTEGER REFERENCES restaurants(id) NOT NULL
    );
  `;
  await client.query(SQL);
};

// Create a customer
const createCustomer = async(name) => {
  const SQL = `INSERT INTO customers(name) VALUES($1) RETURNING *`;
  const response = await client.query(SQL, [name]);
  return response.rows[0];
};

// Create a restaurant
const createRestaurant = async(name) => {
  const SQL = `INSERT INTO restaurants(name) VALUES($1) RETURNING *`;
  const response = await client.query(SQL, [name]);
  return response.rows[0];
};

// Fetch all customers
const fetchCustomers = async() => {
  const SQL = `SELECT * FROM customers`;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch all restaurants
const fetchRestaurants = async() => {
  const SQL = `SELECT * FROM restaurants`;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch all reservations with customer and restaurant details
const fetchReservations = async() => {
  const SQL = `
    SELECT 
      r.*,
      c.name AS customer_name,
      rest.name AS restaurant_name
    FROM reservations r
    JOIN customers c ON r.customer_id = c.id
    JOIN restaurants rest ON r.restaurant_id = rest.id
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// Create a reservation
const createReservation = async({ date, party_count, customer_id, restaurant_id }) => {
  const SQL = `
    INSERT INTO reservations(date, party_count, customer_id, restaurant_id) 
    VALUES($1, $2, $3, $4) 
    RETURNING *
  `;
  const response = await client.query(SQL, [date, party_count, customer_id, restaurant_id]);
  return response.rows[0];
};

// Delete a reservation
const destroyReservation = async(id) => {
  const SQL = `DELETE FROM reservations WHERE id = $1`;
  await client.query(SQL, [id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation
};
