import React, { Component } from 'react';
import SessionManager from "../services/SessionManager.js";
import {UnauthorizedProfileMenu} from './profileMenus/UnauthorizedProfileMenu.js';
import {AuthorizedProfileMenu} from './profileMenus/AuthorizedProfileMenu.js';
import { ReactComponent as ProfileIcon } from '../assets/profile-icon.svg';
import "./MenuStyles.css";
export class ProfileMenuButton extends Component {
  static displayName = ProfileMenuButton.name;
  constructor(props){
      super(props);
      this.state = {
          isOpen: false,
      };
      this.closeMenu = this.closeMenu.bind(this);
      this.openMenu = this.openMenu.bind(this);
      this.leaveFromAccount = this.leaveFromAccount.bind(this);
  }
  closeMenu(){
    this.setState({
      isOpen: false
    });
  }
  async leaveFromAccount(){
    SessionManager.sendRequest("users/logout", "POST")
      .then(n=>{
        SessionManager.removeUserSession();
        window.location.href = "/";
      })
      .catch(e=>alert(e));
    this.closeMenu();
  }
  openMenu(){
    this.setState({
      isOpen: true
    });
  }
  render() {
    let profile = SessionManager.getUserProfileImage();
    return (this.state.isOpen?
        (<div className="profile-menu-container">
          <div className="profile-menu-close-button" onClick={this.closeMenu}>
            {profile?<img className="open-profile-image" width="55px" height="55px" src={profile}/>:<ProfileIcon width="40px" height="40px"/>}
          </div>
            {SessionManager.hasUserSession() ?<AuthorizedProfileMenu leaveFromAccount={this.leaveFromAccount} close={this.closeMenu}/>:<UnauthorizedProfileMenu close={this.closeMenu}/>}
        </div>)
         :
        <div className="profile-menu-button" onClick={this.openMenu}>
          {profile?<img className="profile-image" width="60px" height="60px" src={profile}/>:<ProfileIcon width="40px" height="40px"/>}
        </div>
      );
  }
}