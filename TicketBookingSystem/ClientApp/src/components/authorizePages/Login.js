import React, { Component } from 'react';
import {ReactComponent as GoogleIcon} from "../assets/google-auth-icon.svg";
import {FormInputField} from "./FormInputField.js";
import SessionManager from "../services/SessionManager.js";
import "./AuthStyles.css";

export class Login extends Component {
  static displayName = Login.name;

  constructor(props) {
    super(props);
    this.state = {
      login: "",
      password: "",
      error: ""
    };
    this.loginValueChange = this.loginValueChange.bind(this);
    this.passwordValueChange = this.passwordValueChange.bind(this);
    this.loginUser = this.loginUser.bind(this);
  }
  loginValueChange(value){
    this.setState({login: value});
  }
  passwordValueChange(value){
    this.setState({password: value});
  }
  async loginUser(){
    let error = "";
    if(!this.state.login || !this.state.password){
      this.setState({
        error: "Заполните все обязательные поля"
      });
      return;
    }
    await SessionManager.sendRequest("/users/login","POST", null,
      {
        userId: this.state.login,
        password: this.state.password
      }
    ).then(n => {
        if (n.errors) {
            error = n.errors[0];
        } else {
            SessionManager.setUserSession(n);
            window.location.href = n.url;
        }
    }).catch(e=>alert(e));
    this.setState({
      error: error
    });
  }
  render() {
    return (
      <div className="auth-form">
        <p className="page-title">Авторизация</p>
        <FormInputField text="Логин" onChange={this.loginValueChange} required value={this.state.login}/>
        <FormInputField text="Пароль" isPassword onChange={this.passwordValueChange} required value={this.state.password}/>
        <input className="auth-button" type="button" value="Войти" onClick={this.loginUser}/>
        <p>Или войдите с помощью</p>
        <form action="/users/GoogleLogin" method="post">
            <button type="submit" className="google-auth-button">
                 <GoogleIcon className="google-icon" />
            </button>
        </form>
        <div className="form-error-message">{this.state.error}</div>
      </div>
    );
  }
}
