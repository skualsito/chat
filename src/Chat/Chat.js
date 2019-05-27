import React, { Component } from 'react';
import ContenedorChat from './ContenedorChat';
import './Chat.css';
import Contacto from './Contacto';
import { Container, Col, Row,  TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import avatar from './avatar1.jpg';

var socket;

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pkpersona: this.props.pkpersona,
      activeTab: '1',
      arrayContactos: [],
      arrayConectados: [],
    }
    socket = this.props.socket;
    this.agregarContacto = this.agregarContacto.bind(this);
    this.toggle = this.toggle.bind(this);
    this.cargarContactos = this.cargarContactos.bind(this);
  }

  componentDidMount() {
    
    this.cargarContactos();
    socket.on('nuevo-contacto', (function(){
      this.cargarContactos()
    }).bind(this));
  }

  cargarContactos(){
    socket.emit('cargar-contactos', {pkpersona: this.state.pkpersona}, (function(data){
    console.log(data);
      this.setState({arrayContactos: data.contactos, arrayConectados: data.conectados});
    }).bind(this));
  }

  agregarContacto(){
    let pknuevo = prompt('ID de contacto:');
    if (pknuevo !== null) {
      socket.emit('agregar-contacto', {contacto: pknuevo, pkpersona: this.state.pkpersona, estado: 0}, function(data){
        if(data){
          alert('Agregado perro');
        } else {
          alert('Error o ya lo tenes mafia');
        }
      });
    }
  }
  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  


  render() {
    return (
      <div className="chat-centrado">
        <Container className="chat-contenedor">
            <Col xs="3" className="chat-contactos">
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: this.state.activeTab === '1' })}
                    onClick={() => { this.toggle('1'); }}
                  >
                    Contactos
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: this.state.activeTab === '2' })}
                    onClick={() => { this.toggle('2'); }}
                  >
                    Peticiones
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="1">
                  <Row>
                    <button className="btn btn-agregarContacto" onClick={this.agregarContacto}>Agregar Contacto</button>
                    {
                    this.state.arrayContactos && this.state.arrayContactos.map((function(data, key) {
                      const clase = (this.state.arrayConectados.findIndex(x => x.pkpersona === data.fkusuario_receptor) !== -1) ? 'enlinea' : '';
                      if (data.fkestado) {
                        return <Contacto key={key} className={clase} avatar={avatar} nombre={data.user} mensaje='Ultimo mensaje' pkemisor={data.pkusuario} socket={socket} pkpersona={this.state.pkpersona} />
                      } else {
                        return null;
                      }
                      //return <Mensaje key={data.pkmensaje} tipo={tipo} texto={data.mensaje} fecha={this.fechaParse(data.fecha).fecha} hora={this.fechaParse(data.fecha).tiempo} />
                    }).bind(this))
                    }
                    
                  </Row>
                </TabPane>
                <TabPane tabId="2">
                  <Row>
                    <Col xs="12">
                    {
                    this.state.arrayContactos && this.state.arrayContactos.map((function(data, key) {
                      if (data.fkestado === 0) {
                        return <Contacto key={key} avatar={avatar} nombre={data.user} peticion={true} pkemisor={data.pkusuario} socket={socket}pkpersona={this.state.pkpersona} clase="" />
                      } else {
                        return null;
                      }
                    }).bind(this))
                    }
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
            </Col>
            <Col xs="9" className="chat-contenido">
              <Row>
                <ContenedorChat socket={this.props.socket} receptor={this.state.pkpersona} emisor={2} />
              </Row>
            </Col>
        </Container>
      </div>
    );
  }
}

export default Chat;
