const express = require('express')
const app = express()
const port = 3000
// Get the client
const mysql = require('mysql2/promise');

// Create the connection to database
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'login',
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/login', (req, res) => { //req = request = petición; res = response = respuesta;
  const datos = req.query;
  console.log(datos);
  res.send('Inicio Sesion')
})

app.get('/validate', (req, res) => {
  res.send('Sesion validada')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})