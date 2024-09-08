const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors')
const session = require('express-session');
const mysql = require('mysql2/promise');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

//Mantener la sesión iniciada
app.use(session({
  secret: '12345',
  cookie:{
    maxAge:60000
  },

}))

// Create the connection to database
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'mydb',
});

/////////////////////////////

async function login(req, res) { //req = request = petición; res = response = respuesta;
  const datos = req.query;
  const [filas] = await connection.query("SELECT * FROM `acudiente` WHERE `N_id` = '"+ datos.N_id + "'AND `PASSWORD` = '"+ datos.PASSWORD+"'");
      
  if (filas.length == 1 ){
    req.session.usuarios = datos.N_id;
    res.status(200).json({logueado:true})
      }else{
        res.status(401).json({error: 'Datos incorrectos'})
  };
return;}

app.get('/login',login)

function validar(req,res){
  if (req.session.usuarios){
    res.status(200).json({logueado: true})
  }else{
    res.status(401).json({error: 'Usuario no logueado'})
  }return;
}

app.get('/validar',validar)

app.get('/cerrar', (req, res) => {
  req.session.destroy()
  res.status(200).json({logueado: false})
   return;
  }
)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})