const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors')
const session = require('express-session');
const mysql = require('mysql2/promise');
const mysql2 = require('mysql')
const axios = require('axios');


app.listen(8081,()=>{
  console.log('listening...');
})

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
  
}))

app.use(express.json())

//Mantener la sesión iniciada
app.use(session({
  secret: '12345',
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge:60000
  }

}))

// Create the connection to database
const db = mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb',
});

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb',
});

const credentials={
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb',
}

/////////////////////////////

app.post('/registrar-estudiante',(req, res) => { //req = request = petición; res = response = respuesta;
  const sql = "INSERT INTO estudiante (`Tipo_Id`, `Id_Estudiante`, `Nombre`, `Apellido`, `fecha_nacimiento`, `Genero`, `Direccion`, `Clave`, `Codigo_Grado`, `Codigo_Acudiente`) Values (?)";
  const values = [
   req.body.Tipo_Id,
   req.body.Id_Estudiante,
   req.body.Nombre,
   req.body.Apellido,
   req.body.fecha_nacimiento,
   req.body.Genero,
   req.body.Direccion,
   req.body.Clave,
   req.body.Codigo_Grado,
   req.body.Codigo_Acudiente
   ]
   connection.query(sql,[values],(err,data) => {
     if(err) return res.json(err);
     alert("Error en el registro");
     return res.json(data);
   })
 })

 async function inicio(req, res) { //req = request = petición; res = response = respuesta;
 res.status(200).json("Conectado")
      };

async function loginAcudiente(req, res) { //req = request = petición; res = response = respuesta;
  const datosAcudiente = req.query;
  const [filas1] = await connection.query("SELECT 'Nombre' FROM `acudiente` WHERE `N_id` = '"+ datosAcudiente.N_id + "'AND `PASSWORD` = '"+ datosAcudiente.PASSWORD+"'");
  
  if (filas1.length == 1 ){
    req.session.usuario = datosAcudiente.N_id;
    res.status(200).json({logueado:true})

      }else{
        res.status(401).json({error: 'Datos incorrectos'})
      };

 
  };

async function loginDocente(req, res) { //req = request = petición; res = response = respuesta;
  const datosDocente = req.query;
  const [filas2] = await connection.query("SELECT * FROM `docente` WHERE `Id_Docente` = '"+ datosDocente.Id_Docente + "'AND `Clave` = '"+ datosDocente.Clave+"'");
      
      if (filas2.length == 1 ){
        req.session.usuario = datosDocente.Id_Docente;
        res.status(200).json({logueado:true})
          }else{
            res.status(401).json({error: 'Datos incorrectos'})
          };
  };

    async function loginEstudiante(req, res) { //req = request = petición; res = response = respuesta;
    const datosEstudiante = req.query;
    const [filas3] = await connection.query("SELECT * FROM `estudiante` WHERE `Id_Estudiante` = '"+ datosEstudiante.Id_Estudiante + "'AND `Clave` = '"+ datosEstudiante.Clave+"'");
        if (filas3.length == 1 ){
          req.session.usuario = datosEstudiante.Id_Estudiante;
          res.status(200).json({logueado:true})
            }else{
              res.status(401).json({error: 'Datos incorrectos'})
            };  
    };
    
   
    // Ruta para obtener los estudiantes de un acudiente
    app.get('/api/acudiente-estudiante', (req, res) => {
      const {cod_Acudiente} = req.query;
      const query = `SELECT * FROM estudiante WHERE Id_Acudiente = ?`;
      const estudantesList = db.query(query, [cod_Acudiente], (err, rows) => {
        if (err){ 
        
          res.status(500).send(err)
        }else{
          res.status(200).send(rows)
        }
      });
    });

      app.post('/api/eliminar-estudiante',(req,res)=>{
        const {Id_Estudiante} = req.body
        var connection = mysql.createConnection(credentials)
        db.query('DELETE FROM estudiante where Id_Estudiante = ?',Id_Estudiante,(err,result) =>{
          if (err){
            res.status(500).send(err)
          }else{
            res.status(200).send({"status":"success","message":"Usuario Eliminado correctamente"})
          }
        })
      })

      

      app.put('/api/actualizar-estudiante/:Codigo', (req, res) => {
        const Codigo = req.params.Codigo;
        const estudianteActualizado = req.body;
      
        const { Tipo_Id, Id_Estudiante, Nombre, Apellido, fecha_nacimiento, Genero, Direccion, Clave, Codigo_Grado } = estudianteActualizado;
      
        const sql = `UPDATE estudiante SET Tipo_Id = ?, Id_Estudiante = ?, Nombre = ?, Apellido = ?, fecha_nacimiento = ?, Genero = ?, Direccion = ?, Clave = ?, Codigo_Grado = ? WHERE Codigo = ?`;
        connection.query(sql, [Tipo_Id, Id_Estudiante, Nombre, Apellido, fecha_nacimiento, Genero, Direccion, Clave, Codigo_Grado, Codigo], (error, result) => {
          if (err) {
            console.error('Error al actualizar el estudiante:', error);
            return res.status(500).json({ message: 'Error al actualizar el estudiante' });
          }else{
            res.status(200).send({"status":"success","message":"Usuario Actualizado correctamente"})
          }
          res.json({ message: 'Estudiante actualizado correctamente' });
        });
      });
        
      //NOTAS

      //Interfaz Estudiante
      app.get('/api/notas',(req,res)=> {
        const {cod_Acudiente} = req.query;
        const query = `SELECT * FROM notas JOIN estudiante ON notas.Codigo_Estudiante = estudiante.Codigo JOIN acudiente ON acudiente.N_id = estudiante.Id_Acudiente WHERE estudiante.Id_Acudiente = ?`;
          const notasList = db.query(query, [cod_Acudiente], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })

      //Interfaz Docente
      app.get('/api/notas-docente',(req,res)=> {
        const {id_docente} = req.query;
        const query = `SELECT * FROM notas JOIN estudiante ON notas.Codigo_Estudiante = estudiante.Codigo JOIN docente ON notas.Codigo_Docente = docente.Codigo_Docente WHERE docente.Id_Docente = ?`;
          const notasList = db.query(query, [id_docente], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })
      
      // Insertar-Editar y Eliminar NOTAS perfil docente
   
      app.post('/api/eliminar-nota',(req,res)=>{
        const {Codigo_Notas} = req.body
        var connection = mysql.createConnection(credentials)
        db.query('DELETE FROM notas WHERE Codigo_Notas = ?',Codigo_Notas,(err,result) =>{
          if (err){
            res.status(500).send(err)
          }else{
            res.status(200).send({"status":"success","message":"Nota Eliminada correctamente"})
          }
        })
      })
      app.put('/api/actualizar-notas/:Codigo_Notas', (req, res) => {
        const Codigo_Notas = req.params.Codigo_Notas;
        const updatedNota = req.body;
      
        const { Materia, nota } = updatedNota;
      
        const sql = `UPDATE notas SET Materia = ?, nota = ? WHERE Codigo_Notas = ?`;
        connection.query(sql, [Materia, nota, Codigo_Notas], (err, result) => {
          if (err) {
            console.error('Error al actualizar la nota:', err);
            res.status(500).json({ error: 'Error al procesar la solicitud' });
            return;
          }
      
          res.json({ message: 'Nota actualizada correctamente' });
        });
      });
        //////

              

      //notas para perfil de ESTUDIANTE

      app.get('/api/notas-estudiante',(req,res)=> {
        const {cod_Estudiante} = req.query;
        const query = `SELECT * FROM notas JOIN estudiante ON notas.Codigo_Estudiante = estudiante.Codigo WHERE estudiante.Id_Estudiante = ?`;
          const notasList = db.query(query, [cod_Estudiante], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })

      // ASISTENCIA

      //Asistencia Perfil Estudiantes
      app.get('/api/asistencia-estudiante',(req,res)=> {
        const {cod_Estudiante} = req.query;
        const query = `SELECT * FROM asistencia JOIN estudiante ON asistencia.Codigo_Estudiante = estudiante.Codigo JOIN periodos ON asistencia.Periodo = periodos.Codigo JOIN docente ON docente.Codigo_Docente = asistencia.Codigo_Docente WHERE estudiante.Id_Estudiante = ?`;
          const asistenciaList = db.query(query, [cod_Estudiante], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })
     

      // ASISTENCIA

      //Asistencia Perfil Estudiantes      
      app.get('/api/horario-estudiante',(req,res)=> {
        const {cod_Estudiante} = req.query;
        const query = `SELECT * FROM horarioestudiante JOIN estudiante ON horarioestudiante.Codigo_Estudiante = estudiante.Codigo JOIN docente ON docente.Codigo_Docente = horarioestudiante.Codigo_Docente WHERE estudiante.Id_Estudiante = ?`;
          const horarioList = db.query(query, [cod_Estudiante], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })


          app.get('/codigo-acudientes/:id', (req, res) => {
            const id_Acudiente = req.params.id;
          
            const sql = 'SELECT * FROM acudiente WHERE N_id = ?';
          
            db.query(sql, [id_Acudiente], (err, results) => {
              if (err) {
                console.error('Error al ejecutar la consulta:', err);
                res.status(500).json({ error: 'Error al obtener el acudiente' });
                return;
              }
              res.json(results);
            });
          });



app.get('/',inicio)
/*app.get('/acudiente-estudiantes',estudiantexacudiente)*/
app.get('/login-Acudiente',loginAcudiente)
app.get('/login-Docente',loginDocente)
app.get('/login-Estudiante',loginEstudiante)





function validar(req,res){
  if (req.session.usuario){
    res.status(200).json({logueado: true})
  }else{
    res.status(401).json({error: 'Usuario no logueado'})
  }return;
}

app.get('/validar',validar)

//app.get('/cerrar', (req, res) => {
  //req.session.destroy();
  //res.status(200).json({logueado: false});
  //});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})