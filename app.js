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

async function loginAcudiente(req, res) { //req = request = petición; res = response = respuesta;
  const datosAcudiente = req.query;
  const [filas] = await connection.query("SELECT * FROM `acudiente` WHERE `N_id` = '"+ datosAcudiente.N_id + "'AND `PASSWORD` = '"+ datosAcudiente.PASSWORD+"'");
      
  if (filas.length == 1 ){
    req.session.usuarios = datosAcudiente.N_id;
    res.status(200).json({logueado:true})
      }else{
        res.status(401).json({error: 'Datos incorrectos'})
      }}
async function loginDocente(req, res) { //req = request = petición; res = response = respuesta;
  const datosDocente = req.query;
  const [filas] = await connection.query("SELECT * FROM `docente` WHERE `Id_Docente` = '"+ datosDocente.Id_Docente + "'AND `Clave` = '"+ datosDocente.Clave+"'");
      
      if (filas.length == 1 ){
        req.session.usuarios = datosDocente.Id_Docente;
        res.status(200).json({logueado:true})
          }else{
            res.status(401).json({error: 'Datos incorrectos'})
          }
    }

    async function loginEstudiante(req, res) { //req = request = petición; res = response = respuesta;
    const datosEstudiante = req.query;
    const [filas] = await connection.query("SELECT * FROM `estudiante` WHERE `Id_Estudiante` = '"+ datosEstudiante.Id_Estudiante + "'AND `Clave` = '"+ datosEstudiante.Clave+"'");
        
        if (filas.length == 1 ){
          req.session.usuarios = datosEstudiante.Id_Estudiante;
          res.status(200).json({logueado:true})
            }else{
              res.status(401).json({error: 'Datos incorrectos'})
            }
    return usuarios;
  
return;}

app.get('/login-Acudiente',loginAcudiente)
app.get('/login-Docente',loginDocente)
app.get('/login-Estudiante',loginEstudiante)

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