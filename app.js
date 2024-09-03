const express = require('express');
const app = express();
const port = 3000
const cors = require('cors')
const session = require('express-session');
var usuario = 
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
//Mantener la sesión iniciada
app.use(session({
  secret: 'aojdisabfgaeuepwo',
  resave: false,
  saveUninitialized: true

}))
// Get the client

const mysql = require('mysql2/promise');

// Create the connection to database
const connection = mysql.createPool({
  host: 'localhost',

  user: 'root',
  database: 'mydb',
});

/////////////////////////////
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/mydb',async (req, res) => { //req = request = petición; res = response = respuesta;
  const datos = req.query;

  try {
    const [results, fields] = await connection.query(
      "SELECT * FROM `Acudiente` WHERE `N_id` = ? AND `PASSWORD` = ?",
      [datos.N_id,datos.PASSWORD]
    );

  if (results.length > 0 ){
    req.session.usuario = datos.usuario;
    res.status(200).send('Inicio de sesión correcto')
      }else{
        res.status(401).send('Datos incorrectos')
  };

  } catch (err) {
    console.log(err);
  }

})

app.get('/validar', (req, res) => {
  if (req.session,usuario){
    res.status(200).send('Sesion validada')
  }else{
    res.status(401).send('No autorizado')
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})