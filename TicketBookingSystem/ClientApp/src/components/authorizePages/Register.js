import React, { Component } from 'react';
import {FormInputField} from "./FormInputField.js";
import {ReactComponent as GoogleIcon} from "../assets/google-auth-icon.svg";
import SessionManager from "../services/SessionManager.js";
import "./AuthStyles.css";

export class Register extends Component {
  static displayName = Register.name;

  constructor(props) {
    super(props);
    this.state = {
      login: "",
      email: "",
      password: "",
      repeat_password: "",
      error: ""
    };
    this.loginValueChange = this.loginValueChange.bind(this);
    this.passwordValueChange = this.passwordValueChange.bind(this);
    this.emailValueChange = this.emailValueChange.bind(this);
    this.repeatPasswordValueChange = this.repeatPasswordValueChange.bind(this);
    this.registerUser = this.registerUser.bind(this);

  }
  loginValueChange(value){
    this.setState({login: value});
  }
  emailValueChange(value){
    this.setState({email: value});
  }
  passwordValueChange(value){
    this.setState({password: value});
  }
  repeatPasswordValueChange(value){
    this.setState({repeat_password: value});
  }
  validateEmail(email){
    // eslint-disable-next-line
    return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };
  async registerUser(){
    let p = this.state.password;
    let l = this.state.login;
    let e = this.state.email;
    let rp = this.state.repeat_password;
    if(p.length === 0 || p.length === 0 || p.length === 0 || p.length === 0){
      this.setState({error: "Заполните все обязательные поля"});
      return;
    }
    if(l.length > 30){
      this.setState({error: "Длинна логина не должна превышать 30 символов"});
      return;
    }
    if(!this.validateEmail(e)){
      this.setState({error: "email не является валидным"});
      return;
    }
    if(p !== rp){
      this.setState({error: "Пароль не совпадает"});
      return;
    }
    let error = "";
    await SessionManager.sendRequest("/users/register","POST", null,
      {
        username: this.state.login,
        email: this.state.email,
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
      error: error,
    });
  }
  render() {
    return (
      <div className="auth-form">
        <p className="page-title">Регистрация</p>
        <FormInputField text="Логин" onChange={this.loginValueChange} required value={this.state.login}/>
        <FormInputField text="Email" onChange={this.emailValueChange} required value={this.state.email}/>
        <FormInputField text="Пароль" isPassword onChange={this.passwordValueChange} required value={this.state.password}/>
        <FormInputField text="Повтор пароля" isPassword onChange={this.repeatPasswordValueChange} required value={this.state.repeat_password}/>
        <input className="auth-button" type="button" value="Зарегистрироваться" onClick={this.registerUser}/>
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
