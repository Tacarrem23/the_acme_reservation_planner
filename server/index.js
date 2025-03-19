const express = require('express');
const app = express();
const { client, createTables, createCustomer, createRestaurant, fetchCustomers, fetchRestaurants, createReservation, destroyReservation } = require('./db');

app.use(express.json());

app.get('/api/customers', async(req, res, next) => {
  try {
    res.send(await fetchCustomers());
  }
  catch(ex) {
    next(ex);
  }
});

app.get('/api/restaurants', async(req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  }
  catch(ex) {
    next(ex);
  }
});

app.get('/api/reservations', async(req, res, next) => {
  try {
    const SQL = 'SELECT * FROM reservations';
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex) {
    next(ex);
  }
});

app.post('/api/customers/:id/reservations', async(req, res, next) => {
  try {
    res.status(201).send(await createReservation({customer_id: req.params.id, ...req.body}));
  }
  catch(ex) {
    next(ex);
  }
});

app.delete('/api/customers/:customer_id/reservations/:id', async(req, res, next) => {
  try {
    await destroyReservation(req.params.id);
    res.sendStatus(204);
  }
  catch(ex) {
    next(ex);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: 'An unexpected error occurred.' });
});

const init = async() => {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [customer1, customer2] = await Promise.all([
    createCustomer({ name: 'John Doe' }),
    createCustomer({ name: 'Jane Smith' })
  ]);
  console.log(`created customers ${customer1.id} and ${customer2.id}`);
  const [restaurant1, restaurant2] = await Promise.all([
    createRestaurant({ name: 'Acme Grill' }),
    createRestaurant({ name: 'Coyote Diner' })
  ]);
  console.log(`created restaurants ${restaurant1.id} and ${restaurant2.id}`);
  const reservation = await createReservation({ 
    customer_id: customer1.id, 
    restaurant_id: restaurant1.id,
    date: '2023-04-01',
    party_count: 4
  });
  console.log(`created reservation ${reservation.id}`);
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();

