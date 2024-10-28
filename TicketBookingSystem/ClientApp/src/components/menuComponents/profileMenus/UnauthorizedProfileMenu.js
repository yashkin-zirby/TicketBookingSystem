import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import "../MenuStyles.css";
export class UnauthorizedProfileMenu extends Component {
  static displayName = UnauthorizedProfileMenu.name;
  goToLoginPage(){

  }
  goToRegisterPage(){

  }
  render() {
    return (
      <div className="unauth-menu">
      	<div className="menu-text" onClick={this.props.close}>
          <Link to="/auth/login">Войти в аккаунт</Link>
        </div>
        <div className="menu-text" onClick={this.props.close}>
          <Link to="/auth/register">Зарегистрироваться</Link>
        </div>
      </div>
    );
  }
}