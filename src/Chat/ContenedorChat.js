import React, { Component } from 'react';
import Mensaje from './Mensaje';
import {Col, Button } from 'reactstrap';
import avatar from './avatar1.jpg';

var socket;

class ContenedorChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activoOpcion: false,
      mensaje: "",
      arrayMensajes: [],
      pkchat: 0
    }
    this.activoClase = this.activoClase.bind(this);
    this.inputMensaje = this.inputMensaje.bind(this);
    this.enviarMensaje = this.enviarMensaje.bind(this);
    this.keyPress = this.keyPress.bind(this);
    socket = this.props.socket;
    
  }
  componentDidMount(){
    socket.on('cargar-mensajes', (function(data){
      this.ordenarMensajes(data.mensajes);
    }).bind(this));
    socket.emit('cargar-chat', {receptor: this.props.receptor, emisor: this.props.emisor}, (function(data){
      this.setState({pkchat: data.chat});
      this.ordenarMensajes(data.mensajes);
    }).bind(this));
  }
  activoClase(){
    const currentClass = this.state.activoOpcion;
    this.setState({activoOpcion: !currentClass});
  }
  inputMensaje(event) {
    this.setState({mensaje: event.target.value});
  }

  enviarMensaje(event) {
    socket.emit('enviar-mensaje', {texto: this.state.mensaje, pkpersona: this.props.receptor, chat: this.state.pkchat}, (function(data){
      this.setState({mensaje: ""});
      this.ordenarMensajes(data.mensajes);
    }).bind(this));
    event.preventDefault();
  }

  keyPress(e) {
    if(e.keyCode === 13) {
      this.enviarMensaje(e);
    }
  }
  
  fechaParse(fecha){
    var hora, dia;
    fecha = fecha.split('T');
    hora = fecha[1].split(':');
    hora = hora[0]+':'+hora[1];
    dia = fecha[0].split('-');
    dia = dia[2]+'/'+dia[1]+'/'+dia[0];
    return {fecha: dia, tiempo: hora};
  }

  ordenarMensajes(mensajes){
    var txtAnt, hsAnt, dAnt, arrayMsj = [], pkpersona;
    mensajes && mensajes.map((function(data) {
      var hsNow = this.fechaParse(data.fecha).tiempo;
      var dNow = this.fechaParse(data.fecha).fecha;
      if (hsNow === hsAnt && dNow === dAnt && data.fkusuario === pkpersona) {
        arrayMsj[arrayMsj.length-1].mensaje = txtAnt+' \n '+data.mensaje;
        arrayMsj[arrayMsj.length-1].fecha = data.fecha;
        txtAnt = txtAnt+' \n '+data.mensaje;
      } else {
        arrayMsj.push(data);
        txtAnt = data.mensaje;
      }
      hsAnt = hsNow;
      dAnt = dNow;
      pkpersona = data.fkusuario;
    }).bind(this));
    this.setState({arrayMensajes: arrayMsj});
    document.getElementById("contenedorMensajes").scrollTop = document.getElementById("contenedorMensajes").scrollHeight;
  }
  render() {
    return (
      <>
        <Col xs="12" className="chat-info">
          <div className="info-contacto">
            <div className="info-imagen"><img src={avatar} alt="Juan" /></div>
            <div className="info-nombre">Juan</div>
            <div className="info-estado">En linea</div>
          </div>
          <div className="info-opciones">
            <div className="opciones-boton" onClick={this.activoClase}><i className="fas fa-ellipsis-v"></i></div>
            <ul className={this.state.activoOpcion ? "opciones-botones activo" : "opciones-botones"}>
              <li>boton 1</li>
            </ul>
          </div>
        </Col>
        <Col xs="12" className="chat-mensajes" id="contenedorMensajes">
          {
          this.state.arrayMensajes && this.state.arrayMensajes.map((function(data) {
            const tipo = data.fkusuario === this.props.receptor ? 'emisor' : 'receptor';
            return <Mensaje key={data.pkmensaje} tipo={tipo} texto={data.mensaje} fecha={this.fechaParse(data.fecha).fecha} hora={this.fechaParse(data.fecha).tiempo} />
          }).bind(this))
          }
        </Col>
        <Col xs="12" className="chat-input">
          <input type="text" placeholder="Mensajito..." name="txtmensaje" value={this.state.mensaje} onKeyUp={this.keyPress} onChange={this.inputMensaje} /> <Button color="primary" onClick={this.enviarMensaje}><i className="fas fa-paper-plane" /></Button>
        </Col>
      </>
    );
  }
}

export default ContenedorChat;
