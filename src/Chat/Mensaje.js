import React, { Component } from 'react';
import './Mensaje.css';

class Mensaje extends Component {
  render() {
    return (
      <div className="mensaje-contenedor" data-fecha={this.props.fecha}>
        <div className={"mensaje " + this.props.tipo}>
          <div className="mensaje-texto">{this.props.texto}</div>
          <div className="mensaje-hora">{this.props.hora}</div>
        </div>
      </div>
    );
  }
}

export default Mensaje;
