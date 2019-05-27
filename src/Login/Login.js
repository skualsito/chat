import React, { Component } from 'react';
import './Login.css';
import { Container, Col, Row } from 'reactstrap';
var socket;
class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      usuario: '',
      pass: '',
    }
    this.inputUsuario = this.inputUsuario.bind(this);
    this.inputPass = this.inputPass.bind(this);
    this.login = this.login.bind(this);
    this.keyPress = this.keyPress.bind(this);
    socket = this.props.socket;
  }
  inputUsuario(event) {
    this.setState({usuario: event.target.value});
  }
  inputPass(event) {
    this.setState({pass: event.target.value});
  }
  login(event) {
    socket.emit('login', {usuario: this.state.usuario, pass: this.state.pass}, (function(data){
      this.props.pkpersona(data.pkusuario);
    }).bind(this));

    event.preventDefault();
  }
  keyPress(e) {
    if(e.keyCode === 13) {
      this.login(e);
    }
  }
  render() {
    return (
      <Container>
        <Col>
          <Row>
            <Col xs="12">
                  <input type="text" placeholder="Usuario" name="txtusuario" value={this.state.usuario} onChange={this.inputUsuario}  />
            </Col>
            <Col xs="12">
                  <input type="password" placeholder="Password" name="txtpass" onKeyUp={this.keyPress} value={this.state.pass} onChange={this.inputPass}  />
            </Col>
          </Row>
        </Col>
      </Container>
    );
  }
}

export default Login;
