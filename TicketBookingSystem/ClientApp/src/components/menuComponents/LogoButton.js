import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SessionManager from "../services/SessionManager";
import './MenuStyles.css';
export class LogoButton extends Component {
  static displayName = LogoButton.name;
  render() {
    if (SessionManager.checkPermission(SessionManager.permissions.can_use_manager_panel))
        return (<Link className="home-icon-button" to='/panel'>Tickets.by</Link>);
    return (<Link className="home-icon-button" to='/'>Tickets.by</Link>);
  }
}