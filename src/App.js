import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import Chat from './Chat/Chat';
import Login from './Login/Login';
import 'bootstrap/dist/css/bootstrap.min.css';


const socket = socketIOClient("http://11.11.15.8:8080");

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      pkpersona: 0
    }
    this.cambiarPk = this.cambiarPk.bind(this);
  }
  componentDidMount(){
    if (localStorage.getItem('pkpersona') !== '') {
      //this.setState({pkpersona: parseInt(localStorage.getItem('pkpersona'))});
    }
  }
  cambiarPk(pk){
    if (pk !== '') {
      this.setState({pkpersona: pk});
      localStorage.setItem('pkpersona', pk);
    }
  }
  render() {
    if (!this.state.pkpersona) {
      return (
        <Login socket={socket} pkpersona={this.cambiarPk} />
      );
    } else {
      return (
        <Chat socket={socket} pkpersona={this.state.pkpersona} />
      );
    }
    
  }
}

export default App;
