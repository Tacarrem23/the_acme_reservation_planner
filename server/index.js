const express = require('express');
const app = express();
const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation
} = require('./db');

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get('/api/customers', async(req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch(error) {
    next(error);
  }
});

app.get('/api/restaurants', async(req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch(error) {
    next(error);
  }
});

app.get('/api/reservations', async(req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch(error) {
    next(error);
  }
});

app.post('/api/customers/:id/reservations', async(req, res, next) => {
  try {
    const customer_id = req.params.id;
    const { restaurant_id, date, party_count } = req.body;
    
    // Validate input
    if(!restaurant_id || !date || !party_count) {
      return next(new Error('restaurant_id, date, and party_count are required'));
    }
    
    const reservation = await createReservation({
      customer_id,
      restaurant_id,
      date,
      party_count
    });
    
    res.status(201).send(reservation);
  } catch(error) {
    next(error);
  }
});

app.delete('/api/customers/:customer_id/reservations/:id', async(req, res, next) => {
  try {
    const { id, customer_id } = req.params;
    
    // You could add additional validation here to check if the reservation belongs to the customer
    
    await destroyReservation(id);
    res.status(204).send();
  } catch(error) {
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: err.message || 'Server error' });
});

// Setup function to initialize the database
const init = async() => {
  await client.connect();
  console.log('Connected to database');
  
  await createTables();
  console.log('Tables created');
  
  // Seed some data for testing
  const [john, jane] = await Promise.all([
    createCustomer('John Doe'),
    createCustomer('Jane Smith')
  ]);
  console.log('Customers created:', john, jane);
  
  const [italian, mexican] = await Promise.all([
    createRestaurant('Italian Bistro'),
    createRestaurant('Mexican Cantina')
  ]);
  console.log('Restaurants created:', italian, mexican);
  
  const reservation = await createReservation({
    date: '2025-03-20',
    party_count: 4,
    customer_id: john.id,
    restaurant_id: italian.id
  });
  console.log('Reservation created:', reservation);
  
  // Test fetchReservations
  const reservations = await fetchReservations();
  console.log('Fetched reservations:', reservations);
  
  console.log('Database initialized successfully');
};

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Initialize the database
init()
  .catch(err => {
    console.error('Error during initialization', err);
    process.exit(1);
  });

module.exports = app;
