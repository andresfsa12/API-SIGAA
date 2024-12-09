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

//Permite que una web diferente haga peticiones al puerto 3000
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

// Configuración de la sesión
app.use(session({
  secret: 'SIGAA1996*', // Reemplaza con una clave secreta fuerte
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Cambia a true si usas HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

//Mantener sesion iniciada
app.get('/verificar-sesion', (req, res) => {
  if (req.session.usuario) {
    res.json({
      logueado: true,
      usuario: req.session.usuario,
      rol: req.session.rol,
    });
  } else {
    res.json({ logueado: false });
  }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al cerrar sesión' });
    } else {
      res.clearCookie('connect.sid'); // Eliminar la cookie de sesión
      res.status(200).json({ message: 'Sesión cerrada correctamente' });
    }
  });
});



app.use(express.json())


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

async function inicio(req, res) { //req = request = petición; res = response = respuesta;
 res.status(200).json("Conectado")
      };


async function loginAcudiente(req, res) { //req = request = petición; res = response = respuesta;
  const datosAcudiente = req.query;
  const [filas1] = await connection.query("SELECT 'Nombre' FROM `acudiente` WHERE `N_id` = '"+ datosAcudiente.N_id + "'AND `PASSWORD` = '"+ datosAcudiente.PASSWORD+"'");
  
  if (filas1.length == 1 ){
    req.session.usuario = datosAcudiente.N_id;
    req.session.rol = 'acudiente';
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
        req.session.rol = 'docente';
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
        req.session.rol = 'estudiante';
        res.status(200).json({logueado:true})
            }else{
              res.status(401).json({error: 'Datos incorrectos'})
            };  
    };
    
    async function loginAdministrativo(req, res) { //req = request = petición; res = response = respuesta;
      const datosAdministrativo = req.query;
      const [filas3] = await connection.query("SELECT * FROM `administrativo` WHERE `Id_Admin` = '"+ datosAdministrativo.Id_Admin + "'AND `Clave` = '"+ datosAdministrativo.Clave+"'");
         
      if (filas3.length == 1 ){
          req.session.usuario = datosAdministrativo.Id_Admin;
          req.session.rol = 'administrativo';
          res.status(200).json({logueado:true})
              }else{
                res.status(401).json({error: 'Datos incorrectos'})
              };  
      };
//ROLES

// ADMINISTRATIVO

// Ruta para obtener los estudiantes
app.get('/api/administrar-estudiante', (req, res) => {
  const query = `SELECT * FROM estudiante`;
  const studentList = db.query(query, (err, rows) => {
    if (err){ 
    
      res.status(500).send(err)
    }else{
      res.status(200).send(rows)
    }
  });
});


//Insertar nuevo estudiante
app.post('/api/agregar-estudiante', async (req, res) => {
  try {
    const { 
      Tipo_Id,
      Id_Estudiante,
      Nombre,
      Apellido,
      fecha_nacimiento,
      Genero,
      Direccion,
      Clave,
      Codigo_Grado,
      Id_Acudiente } = req.body;

    // Validación básica de los datos 
    if (!Tipo_Id || !Id_Estudiante || !Nombre || !Apellido || !fecha_nacimiento || !Genero || !Direccion || !Clave || !Codigo_Grado || !Id_Acudiente) {
      return res.status(400).json({ message: 'Por favor, completa todos los campos.' });
    }

    // Conexión a la base de datos
    const connection = await mysql.createConnection(credentials);

    // Consulta SQL para insertar el ESTUDIANTE
    const query = `INSERT INTO estudiante (Tipo_Id,
      Id_Estudiante,
      Nombre,
      Apellido,
      fecha_nacimiento,
      Genero,
      Direccion,
      Clave,
      Codigo_Grado,
      Id_Acudiente) VALUES (?, ?, ?, ?, ?,?,?,?,?,?)`;
    
      const values = [Tipo_Id,
      Id_Estudiante,
      Nombre,
      Apellido,
      fecha_nacimiento,
      Genero,
      Direccion,
      Clave,
      Codigo_Grado,
      Id_Acudiente];

    // Ejecutar la consulta
    await connection.execute(query, values);

    // Cerrar la conexión
    connection.end();

    res.status(201).json({ message: 'Estudiante agregado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el estudiante' });
  }
});

/*app.post('/registrar-estudiante',(req, res) => { //req = request = petición; res = response = respuesta;
  const sql = "INSERT INTO estudiante (`Tipo_Id`, `Id_Estudiante`, `Nombre`, `Apellido`, `fecha_nacimiento`, `Genero`, `Direccion`, `Clave`, `Codigo_Grado`, `Id_Acudiente`) Values (?)";
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
  req.body.Id_Acudiente
  ]
  connection.query(sql,[values],(err,data) => {
  if (err) {
      console.error("Error en el registro:", err);
      return res.status(500).json({ error: "Error en el registro" });
  }
  return res.status(200).json({ message: "Registro exitoso", data: data });
  }); 
})*/


  //Eliminar estudiante
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

  //Actualizar estudiante
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

  //Administrar DOCENTE

  // Ruta para obtener los DOCENTES
app.get('/api/administrar-docente', (req, res) => {
  const query = `SELECT * FROM docente`;
  const docenteList = db.query(query, (err, rows) => {
    if (err){ 
    
      res.status(500).send(err)
    }else{
      res.status(200).send(rows)
    }
  });
});

  //Insertar nuevo DOCENTE
app.post('/api/agregar-docente', async (req, res) => {
  try {
    const { 
      Id_Docente, Nombre_Docente, fecha_nacimiento, Genero, Nivel_Academico, Direccion, Ciudad, Celular, Clave } = req.body;

    // Validación básica de los datos 
    if (!Id_Docente ||!Nombre_Docente || !fecha_nacimiento || !Genero || !Nivel_Academico || !Direccion || !Ciudad || !Celular || !Clave) {
      return res.status(400).json({ message: 'Por favor, completa todos los campos.' });
    }

    // Conexión a la base de datos
    const connection = await mysql.createConnection(credentials);

    // Consulta SQL para insertar la nota
    const query = `INSERT INTO docente (Id_Docente, Nombre_Docente, fecha_nacimiento, Genero, Nivel_Academico, Direccion, Ciudad, Celular, Clave) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
      const values = [Id_Docente, Nombre_Docente, fecha_nacimiento, Genero, Nivel_Academico, Direccion, Ciudad, Celular, Clave];

    // Ejecutar la consulta
    await connection.execute(query, values);

    // Cerrar la conexión
    connection.end();

    res.status(201).json({ message: 'Docente agregado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el docente' });
  }
});

//Actualizar DOCENTE
  app.put('/api/actualizar-docente/:Id_Docente', (req, res) => {
    const Id_Docente = req.params.Id_Docente;
    const docenteActualizado = req.body;
  
    const {Nombre_Docente, fecha_nacimiento, Genero, Nivel_Academico, Direccion, Ciudad, Celular, Clave} = docenteActualizado;
  
    const sql = `UPDATE docente SET Nombre_Docente = ?, fecha_nacimiento = ?, Genero = ?, Nivel_Academico = ?, Direccion = ?, Ciudad = ?, Celular = ?, Clave = ? WHERE Id_Docente = ?`;
    connection.query(sql, [Nombre_Docente, fecha_nacimiento, Genero, Nivel_Academico, Direccion, Ciudad, Celular, Clave, Id_Docente], (error, result) => {
      if (err) {
        console.error('Error al actualizar el docente:', error);
        return res.status(500).json({ message: 'Error al actualizar el docente' });
      }else{
        res.status(200).send({"status":"success","message":"Docente Actualizado correctamente"})
      }
      res.json({ message: 'Docente actualizado correctamente' });
    });
  });

  //Eliminar DOCENTE
  app.post('/api/eliminar-docente',(req,res)=>{
    const {Id_Docente} = req.body
    var connection = mysql.createConnection(credentials)
    db.query('DELETE FROM docente WHERE Id_Docente = ?',Id_Docente,(err,result) =>{
      if (err){
        res.status(500).send(err)
      }else{
        res.status(200).send({"status":"success","message":"Docente Eliminado correctamente"})
      }
    })
  })

  //Administrar HORARIO     
  app.get('/api/horario',(req,res)=> {
    const query = `SELECT * FROM horario
      JOIN docente ON horario.Codigo_Docente = docente.Id_Docente`;
      const horarioList = db.query(query, (err,rows)=>{
      if(err){
        res.status(500).send(err)
      }else{
        res.status(200).send(rows)
      }
    })
  })

  //Insertar nuevo registro HORARIO
app.post('/api/agregar-horario', async (req, res) => {
  try {
    const { Dia, Hora, Materia, Codigo_Grado, Jornada, Codigo_Docente} = req.body;

    // Validación básica de los datos 
    if (!Dia || !Hora || !Materia || !Codigo_Grado || !Jornada || !Codigo_Docente) {
      return res.status(400).json({ message: 'Por favor, completa todos los campos.' });
    }

    // Conexión a la base de datos
    const connection = await mysql.createConnection(credentials);

    // Consulta SQL para insertar la nota
    const query = `INSERT INTO horario (Dia, Hora, Materia, Codigo_Grado, Jornada, Codigo_Docente) VALUES (?, ?, ?, ?, ?, ?)`;
    
      const values = [Dia, Hora, Materia, Codigo_Grado, Jornada, Codigo_Docente];

    // Ejecutar la consulta
    await connection.execute(query, values);

    // Cerrar la conexión
    connection.end();

    res.status(201).json({ message: 'Registro agregado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el horario' });
  }
});

//Actualizar HORARIO
  app.put('/api/actualizar-horario/:Codigo', (req, res) => {
    const Codigo = req.params.Codigo;
    const horarioActualizado = req.body;
  
    const {Dia, Hora, Materia, Codigo_Grado, Jornada, Codigo_Docente} = horarioActualizado;
  
    const sql = `UPDATE horario SET Dia = ?, Hora = ?, Materia = ?, Codigo_Grado = ?, Jornada = ?, Codigo_Docente = ? WHERE Codigo = ?`;
    connection.query(sql, [Dia, Hora, Materia, Codigo_Grado, Jornada, Codigo_Docente, Codigo], (error, result) => {
      if (err) {
        console.error('Error al actualizar el docente:', error);
        return res.status(500).json({ message: 'Error al actualizar el horario' });
      }else{
        res.status(200).send({"status":"success","message":"Horario Actualizado correctamente"})
      }
      res.json({ message: 'Horario actualizado correctamente' });
    });
  });

 //Eliminar Registro HORARIO
  app.post('/api/eliminar-horario',(req,res)=>{
    const {Codigo} = req.body
    var connection = mysql.createConnection(credentials)
    db.query('DELETE FROM horario where Codigo = ?',Codigo,(err,result) =>{
      if (err){
        res.status(500).send(err)
      }else{
        res.status(200).send({"status":"success","message":"Registro Eliminado correctamente"})
      }
    })
  })
/////////////////////////////////////////////

// ACUDIENTE

    //Consultar los acudientes
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

      //Consultar Notas
      app.get('/api/notas',(req,res)=> {
        const {cod_Acudiente} = req.query;
        const query = `SELECT * FROM notas 
        JOIN estudiante ON notas.Codigo_Estudiante = estudiante.Codigo 
        JOIN acudiente ON estudiante.Id_Acudiente = acudiente.N_id 
        JOIN periodos ON notas.Codigo_Periodos = periodos.Codigo 
        WHERE acudiente.N_id = ?`;
          const notasList = db.query(query, [cod_Acudiente], (err,rows)=>{
          if(err){
            res.status(500).send(err) 
          }else{
            res.status(200).send(rows)
          }
        })
      })

      //Asistencia Perfil Acudientes
      app.get('/api/asistencia-estudiante-acudiente',(req,res)=> {
        const {cod_EstudianteA} = req.query;
        const query = `SELECT * FROM asistencia 
        JOIN estudiante ON asistencia.Codigo_Estudiante = estudiante.Codigo 
        JOIN periodos ON asistencia.Periodo = periodos.Codigo 
        JOIN docente ON docente.Id_Docente = asistencia.Codigo_Docente 
        JOIN acudiente ON acudiente.N_id = estudiante.Id_Acudiente 
        WHERE acudiente.N_id = ?`;
          const asistenciaList = db.query(query, [cod_EstudianteA], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })
        
//ESTUDIANTE

       //notas para perfil de ESTUDIANTE
       app.get('/api/notas-estudiante',(req,res)=> {
        const {cod_Estudiante} = req.query;
        const query = `SELECT * FROM notas 
        JOIN estudiante ON notas.Codigo_Estudiante = estudiante.Codigo 
        WHERE estudiante.Id_Estudiante = ?`;
          const notasList = db.query(query, [cod_Estudiante], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })

      //Asistencia Perfil Estudiantes
      app.get('/api/asistencia-estudiante',(req,res)=> {
        const {cod_Estudiante} = req.query;
        const query = `SELECT * FROM asistencia JOIN estudiante ON asistencia.Codigo_Estudiante = estudiante.Codigo JOIN periodos ON asistencia.Periodo = periodos.Codigo JOIN docente ON docente.Id_Docente = asistencia.Codigo_Docente WHERE estudiante.Id_Estudiante = ?`;
          const asistenciaList = db.query(query, [cod_Estudiante], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })

      //Horario Perfil Estudiantes      
      app.get('/api/horario-estudiante',(req,res)=> {
        const {cod_Estudiante} = req.query;
        const query = `SELECT * FROM horarioestudiante JOIN estudiante ON horarioestudiante.Codigo_Estudiante = estudiante.Codigo JOIN docente ON docente.Id_Docente = horarioestudiante.Codigo_Docente WHERE estudiante.Id_Estudiante = ?`;
          const horarioList = db.query(query, [cod_Estudiante], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })

//DOCENTE

      //Consultar Notas
      app.get('/api/notas-docente',(req,res)=> {
        const {id_docente} = req.query;
        const query = `SELECT * FROM notas JOIN estudiante ON notas.Codigo_Estudiante = estudiante.Codigo JOIN docente ON notas.Codigo_Docente = docente.Id_Docente WHERE docente.Id_Docente = ?`;
          const notasList = db.query(query, [id_docente], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })
      
      //Eliminar NOTAS perfil docente
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

      //Actualizar NOTAS perfil docente
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
      
      // Agregar una nueva nota
        app.post('/api/agregar-notas', async (req, res) => {
          try {
            const { Codigo_Estudiante, Materia, Codigo_Periodos, nota, Grado, Codigo_Docente } = req.body;

            // Validación básica de los datos 
            if (!Codigo_Estudiante || !Materia || !Codigo_Periodos || !nota || !Grado || !Codigo_Docente) {
              return res.status(400).json({ message: 'Por favor, completa todos los campos.' });
            }

            // Conexión a la base de datos
            const connection = await mysql.createConnection(credentials);

            // Consulta SQL para insertar la nota
            const query = `INSERT INTO notas (Codigo_Estudiante, Materia, Codigo_Periodos, nota, Codigo_Docente) VALUES (?, ?, ?, ?, ?)`;
            const values = [Codigo_Estudiante, Materia, Codigo_Periodos, nota, Grado, Codigo_Docente];

            // Ejecutar la consulta
            await connection.execute(query, values);

            // Cerrar la conexión
            connection.end();

            res.status(201).json({ message: 'Nota agregada correctamente' });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al agregar la nota' });
          }
        });

      //Horario Perfil Docente      
      app.get('/api/horario-docente',(req,res)=> {
        const {id_Docente} = req.query;
        const query = `SELECT * FROM horario JOIN docente ON horario.Codigo_Docente = docente.Id_Docente WHERE docente.Id_Docente = ?`;
          const horarioList = db.query(query, [id_Docente], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })
      
      //Asistencia
      //Consultar Asistencia
      app.get('/api/asistencia-id-docente',(req,res)=> {
        const {id_docente} = req.query;
        const query = `SELECT * FROM asistencia 
        JOIN estudiante ON asistencia.Codigo_Estudiante = estudiante.Codigo 
        JOIN docente ON asistencia.Codigo_Docente = docente.Id_Docente 
        WHERE docente.Id_Docente = ?`;
          const asistenciaList = db.query(query, [id_docente], (err,rows)=>{
          if(err){
            res.status(500).send(err)
          }else{
            res.status(200).send(rows)
          }
        })
      })
      
      //Eliminar ASISTENCIA perfil docente
      app.post('/api/eliminar-asistencia',(req,res)=>{
        const {Codigo_Asistencia} = req.body
        var connection = mysql.createConnection(credentials)
        db.query('DELETE FROM asistencia WHERE Codigo_Asistencia = ?',Codigo_Asistencia,(err,result) =>{
          if (err){
            res.status(500).send(err)
          }else{
            res.status(200).send({"status":"success","message":"Registro Eliminado correctamente"})
          }
        })
      })

      //Actualizar ASISTENCIA perfil docente
      app.put('/api/actualizar-asistencia/:Codigo_Asistencia', (req, res) => {
        const Codigo_Asistencia = req.params.Codigo_Asistencia;
        const updatedAsistencia = req.body;
      
        const { Fecha, Materia } = updatedAsistencia;
      
        const sql = `UPDATE asistencia SET Fecha = ?, Materia = ? WHERE Codigo_Asistencia = ?`;
        connection.query(sql, [Fecha, Materia, Codigo_Asistencia], (err, result) => {
          if (err) {
            console.error('Error al actualizar el resgistro:', err);
            res.status(500).json({ error: 'Error al procesar la solicitud' });
            return;
          }
      
          res.json({ message: 'Asistencia actualizada correctamente' });
        });
      });
      
      // Agregar una nuevo registro en ASISTENCIA
        app.post('/api/agregar-asistencia', async (req, res) => {
          try {
            const { Fecha, Codigo_Estudiante, Materia, Periodo,Codigo_Docente } = req.body;

            // Validación básica de los datos 
            if (!Fecha || !Codigo_Estudiante || !Materia || !Periodo || !Codigo_Docente) {
              return res.status(400).json({ message: 'Por favor, completa todos los campos.' });
            }

            // Conexión a la base de datos
            const connection = await mysql.createConnection(credentials);

            // Consulta SQL para insertar la nota
            const query = `INSERT INTO asistencia (Fecha, Codigo_Estudiante, Materia, Periodo, Codigo_Docente) VALUES (?, ?, ?, ?, ?)`;
            const values = [Fecha, Codigo_Estudiante, Materia, Periodo,Codigo_Docente];

            // Ejecutar la consulta
            await connection.execute(query, values);

            // Cerrar la conexión
            connection.end();

            res.status(201).json({ message: 'Asistencia agregada correctamente' });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al agregar la Asistencia' });
          }
        });

app.get('/',inicio)
/*app.get('/acudiente-estudiantes',estudiantexacudiente)*/
app.get('/login-Acudiente',loginAcudiente)
app.get('/login-Docente',loginDocente)
app.get('/login-Estudiante',loginEstudiante)
app.get('/login-Administrativo',loginAdministrativo)




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})