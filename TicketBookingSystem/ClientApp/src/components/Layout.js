import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Menu } from './Menu.js';
import { Footer } from './Footer.js';
import { BookingWindow } from "./modalWindows/BookingWindow.js";
import { ConfirmUnbookingWindow } from "./modalWindows/ConfirmUnbookingWindow.js";
import { RemoveConcertWindow } from './modalWindows/RemoveConcertWindow.js';
import { AddConcertWindow } from './modalWindows/AddConcertWindow.js';
import { RemovePromocodeWindow } from './modalWindows/RemovePromocodeWindow';
import { AddPromocodeWindow } from './modalWindows/AddPromocodeWindow';
import { MapWindow } from './modalWindows/MapWindow';
import "./Layout.css";

export class Layout extends Component {
  static displayName = Layout.name;

    render() {
    return (
      <div className="layout">
        <Menu />
        <div className="container">
          <Container>
            {this.props.children}
          </Container>
        </div>
        <Footer/>
        <BookingWindow/>
        <ConfirmUnbookingWindow/>
        <RemoveConcertWindow/>
        <AddConcertWindow/>
        <RemovePromocodeWindow/>
        <AddPromocodeWindow/>
        <MapWindow/>
      </div>
    );
  }
}
