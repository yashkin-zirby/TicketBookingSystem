import React, { Component } from 'react';
import {SearchAndFilterQuery} from './menuComponents/SearchAndFilterQuery.js';
import {ProfileMenuButton} from './menuComponents/ProfileMenuButton.js';
import {LogoButton} from './menuComponents/LogoButton.js';
import {TicketsCartButton} from './menuComponents/TicketsCartButton.js';
import './Menu.css';

export class Menu extends Component {
    static displayName = Menu.name;
    component
    render() {
    return (
      <header className="menu-header">
        <LogoButton />
        <SearchAndFilterQuery />
        <div className="menu-combine-buttons">
          <TicketsCartButton/>
          <ProfileMenuButton/>
        </div>
      </header>
    );
  }
}
