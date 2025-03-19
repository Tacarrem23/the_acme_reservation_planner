
const { Client } = require('pg');

const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_reservation_planner');

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

const createCustomer = async({ name }) => {
  const SQL = 'INSERT INTO customers(name) VALUES($1) RETURNING *';
  const response = await client.query(SQL, [name]);
  return response.rows[0];
};

const createRestaurant = async({ name }) => {
  const SQL = 'INSERT INTO restaurants(name) VALUES($1) RETURNING *';
  const response = await client.query(SQL, [name]);
  return response.rows[0];
};

const fetchCustomers = async() => {
  const SQL = 'SELECT * FROM customers';
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async() => {
  const SQL = 'SELECT * FROM restaurants';
  const response = await client.query(SQL);
  return response.rows;
};

const createReservation = async({ customer_id, restaurant_id, date, party_count }) => {
  const SQL = 'INSERT INTO reservations(customer_id, restaurant_id, date, party_count) VALUES($1, $2, $3, $4) RETURNING *';
  const response = await client.query(SQL, [customer_id, restaurant_id, date, party_count]);
  return response.rows[0];
};

const destroyReservation = async(id) => {
  const SQL = 'DELETE FROM reservations WHERE id = $1';
  await client.query(SQL, [id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation
};
