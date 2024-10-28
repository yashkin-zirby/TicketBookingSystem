import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SessionManager from "../../services/SessionManager";
import { ReactComponent as TicketsIcon } from '../../assets/tickets-icon.svg';
import { ReactComponent as ProfileIcon } from '../../assets/profile-icon.svg';
import { ReactComponent as ExitIcon } from '../../assets/exit-icon.svg';
import "../MenuStyles.css";
export class AuthorizedProfileMenu extends Component {
  static displayName = AuthorizedProfileMenu.name;
  render() {
    return (
      <div className="auth-menu">
        <div className="auth-menu-icons">
          <ProfileIcon height="25"/>
          {
             SessionManager.checkPermission(SessionManager.permissions.can_use_manager_panel) ? null :
                <TicketsIcon height="25" />
          }
          <ExitIcon height="25"/>
        </div>
        <div className="auth-menu-links">
          <Link className="menu-text" to='/profile' onClick={this.props.close}>Профиль</Link>
                {
                    SessionManager.checkPermission(SessionManager.permissions.can_use_manager_panel) ? null :
                    <Link className="menu-text" to='/tickets-cart' onClick={this.props.close}>Ваши билеты</Link>
                }
          <div className="menu-text pointer" onClick={this.props.leaveFromAccount}>Выйти</div>
        </div>
      </div>
    );
  }
}