import React, { Component } from 'react';
import SessionManager from "../services/SessionManager.js";
import {Link} from 'react-router-dom';
import { ReactComponent as TicketsIcon } from '../assets/tickets-icon.svg';
import "./MenuStyles.css";
export class TicketsCartButton extends Component {
  static displayName = TicketsCartButton.name;
  render() {
      if (SessionManager.checkPermission(SessionManager.permissions.can_use_manager_panel)) return null;
      return (SessionManager.hasUserSession()?
      <div className="cart-button-container">
      <Link className="menu-text" to='/tickets-cart'>
        <div className="cart-button">
          <div className="menu-text">Ваши билеты</div>
      	 <TicketsIcon/>
        </div>
      </Link>
          </div> :
      null
    );
  }
}