import React, { Component } from 'react';
import './Contacto.css';
var socket;
class Contacto extends Component {
  constructor(props){
    super(props);
    this.state = {
      pkpersona: this.props.pkpersona,
    }
    socket = this.props.socket;
  }
  aceptarContacto(pk){
    socket.emit('aceptar-contacto', {pkpersona: this.state.pkpersona, contacto: pk});
  }
  abrirChat(pkpersona) {
    console.log(pkpersona);
  }
  render() {
    return (
      <div className={"contacto " + this.props.className} onClick={(!this.props.peticion) ? this.abrirChat.bind(this, this.props.pkemisor) : null}>
        <div className="contacto-imagen">
          <img src={this.props.avatar} alt={this.props.nombre}/>
        </div>
        <div className="contacto-nombre">{this.props.nombre}</div>
        {
          (!this.props.peticion) ? (
            <div className="contacto-mensaje">{this.props.mensaje}</div>
          ) : (
            <div className="contacto-peticion"><button className="btn btnAceptar" onClick={this.aceptarContacto.bind(this, this.props.pkemisor)}>Aceptar</button><button className="btn btnCancelar">Cancelar</button></div>
          )
        }
        
      </div>
    );
  }
}

export default Contacto;
