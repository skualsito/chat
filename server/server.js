var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require("mysql");
var md5 = require('md5');


function handleDisconnect() {
  con = mysql.createConnection({
      host: "127.0.0.1",
      //user: "skual",
      user: "root",
      //password: "enikma",
      password: "",
      database: "prueba",
      insecureAuth: true,
      charset: 'latin1_swedish_ci'
  });

  con.connect(function(err) {
      if (err) {
          console.log('Error en la conexion de la base:', err);
          setTimeout(handleDisconnect, 2000);
      }
  });

  con.on('error', function(err) {
      console.log('Error db:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          handleDisconnect();
      } else {
          throw err;
      }
  });
}

handleDisconnect();


var conectados = [];

io.on('connection', function(socket){
    console.log('Se conecto un pibe');
    
    socket.on('enviar-mensaje', function(mensaje, callback){
        crearMensaje(mensaje, function(data){
          if(data.estado){
            cargarMensajes(mensaje.chat, function(mensajes){
              callback(mensajes);
              socket.emit('cargar-mensajes', mensajes);
            });
          }
        });
    });

    socket.on('login', function(data, callback){
      usuarioLogin(data, function(data){
        callback(data);
        conectados.push({pkpersona: data.pkusuario, socketID: socket.id});
      });
    });
    socket.on('cargar-chat', function(chat, callback){
      cargarChat(chat, function(data){
        callback(data);
      });
    });
    socket.on('agregar-contacto', function(contacto, callback){
      agregarContacto(contacto, function(data){
        callback(data.estado);
        if (data.estado) {
          socket.emit('nuevo-contacto');
          socket.broadcast.to(traerSocket(contacto.contacto)).emit('nuevo-contacto');
        }
      });
    });
    socket.on('aceptar-contacto', function(contacto){
      aceptarContacto(contacto, function(data){
        if (data.estado) {
          socket.emit('nuevo-contacto');
          socket.broadcast.to(traerSocket(contacto.contacto)).emit('nuevo-contacto');
        }
      });
    });
    socket.on('cargar-contactos', function(contacto, callback){
      cargarContactos(contacto, function(data){
        callback({contactos: data, conectados: conectados});
      });
    });

    socket.on('disconnect', function() {
      console.log('Desconectado guacho');
      var i = conectados.findIndex(x => x.socketID === socket.id);
      conectados.splice(i, 1);
    });

    
});

http.listen(8080, function(){
  console.log('Funcando en 8080');
});

function traerSocket(pk){
  var i = conectados.findIndex(x => x.pkpersona === parseInt(pk));
  var socketConectado;
  if (i !== -1) {
    socketConectado = conectados[i].socketID;
  }
  return socketConectado;
}
function usuarioInsert(data, callback) {
  con.query("INSERT INTO usuarios (user, pass, nombre, apellido) VALUES (?, ?, ?, ?)", [data.usuario, md5(data.pass), "", ""], function(err, rows) {
      if (!err) {
        callback({estado: 1, pkusuario: rows.insertId});
      } else {
        callback({estado: 0, msj: "Error, de nuevo."});
      }
  });
};
function usuarioExist(data, callback) {
  con.query("SELECT * FROM usuarios WHERE user = ?", [data.usuario], function(err, rows) {
    if (!err) {
      if (rows.length != 0) {
        if(rows[0]['pass'] == md5(data.pass)){
          callback({estado: 1, pkusuario: rows[0]['pkusuario']});
        } else {
          callback({estado: 0, msj: "Error, la pass."});
        }
      } else {
        callback({estado: 2});
      }
    } else {
      console.log(err);
    }
  });
};
function usuarioLogin(login, callback) {
  usuarioExist(login, function(data){
    switch (data.estado) {
      case 2:
        usuarioInsert(login, function(data){
            callback(data);
        });
      break;
    
      default:
        callback(data);
      break;
    }
  });
}
function cargarChat(data, callback) {
  con.query("SELECT * FROM chats WHERE (fkemisor = ? AND fkreceptor = ?) OR (fkemisor = ? AND fkreceptor = ?)", [data.emisor, data.receptor, data.receptor, data.emisor], function(err, rows) {
      if (!err) {
        if (rows.length != 0) {
          cargarMensajes(rows[0]['pkchat'], callback);
        } else {
          crearChat(data, callback);
        }
      } else {
        console.log(err);
      }
  });
};
function cargarMensajes(data, callback) {
  con.query("SELECT * FROM mensajes WHERE fkchat = ?", [data], function(err, rows) {
    if (!err) {
      callback({chat: data, mensajes: rows});
    } else {
      console.log(err);
    }
  });
};
function crearChat(data, callback) {
  con.query("INSERT INTO chats (fkemisor, fkreceptor) VALUES (?, ?)", [data.emisor, data.receptor], function(err, rows) {
      if (!err) {
        callback({chat: rows.insertId, mensajes: []});
      } else {
        console.log(err);
      }
  });
};
function crearMensaje(data, callback) {
  con.query("INSERT INTO mensajes (mensaje, fkusuario, fkchat, fkestado) VALUES (?, ?, ?, ?)", [data.texto, data.pkpersona, data.chat, 0], function(err) {
      if (!err) {
        callback({estado:1});
      } else {
        console.log(err);
      }
  });
};
function agregarContacto(data, callback) {
  con.query("INSERT INTO usuarios_rel (fkusuario_receptor, fkusuario_emisor, fkestado) VALUES (?, ?, ?)", [data.pkpersona, data.contacto, data.estado], function(err, rows) {
      if (!err) {
        callback({estado: 1});
      } else {
        callback({estado: 0});
        console.log(err);
      }
  });
};
function cargarContactos(data, callback) {
  con.query("SELECT * FROM usuarios_rel INNER JOIN usuarios ON pkusuario = fkusuario_receptor WHERE fkusuario_emisor = ?", [data.pkpersona], function(err, rows) {
      if (!err) {
        callback(rows);
      } else {
        console.log(err);
      }
  });
};
function aceptarContacto(contacto, callback) {
  agregarContacto(contacto, function(data){
    if(data.estado){
      con.query("UPDATE usuarios_rel SET fkestado = ? WHERE (fkusuario_receptor = ? AND fkusuario_emisor = ?) OR (fkusuario_receptor = ? AND fkusuario_emisor = ?)", [1, contacto.pkpersona, contacto.contacto, contacto.contacto, contacto.pkpersona], function(err, rows) {
          if (!err) {
            callback({estado:1});
          } else {
            console.log(err);
          }
      });
    }
  });
};