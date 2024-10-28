import React, { Component } from 'react';
import {ReactComponent as MapIcon} from "../assets/map-icon.svg";
import {ReactComponent as DateIcon} from "../assets/date-icon.svg";
import { ReactComponent as MapPointIcon } from "../assets/map-point.svg";
import EventDispatcher from '../services/EventDispatcher';
import { ConfirmUnbookingWindow } from "../modalWindows/ConfirmUnbookingWindow.js";
import { MapWindow } from '../modalWindows/MapWindow';
import './TicketsStyles.css';
export class BookedTicket extends Component {
  static displayName = BookedTicket.name;

  constructor(props) {
      super(props);
      this.types = { "O": "Опенэир", "C": "Классическая музыка", "P": "Вечеринка" }
      if (this.props.data) {
        let data = this.props.data.concert.concertData.split("\n");
        this.typeInfo = data.map(n=><p key={n}>{n}</p>);
      }
      this.unbookTicket = this.unbookTicket.bind(this);
      this.openMap = this.openMap.bind(this);
  }
  formatDate(date) {
     if (typeof date === "string") date = new Date(date);
     let h = date.getHours().toString();
     let m = date.getMinutes().toString();
     return date.toLocaleDateString() + " " + (h.length < 2 ? "0" + h : h) + ":" + (m.length < 2 ? "0" + m : m);
    }
    unbookTicket(){
      if (this.props.data) {
          EventDispatcher.dispatch("onopenmodal" + ConfirmUnbookingWindow.modalName, this.props.data);
      }
    }
    openMap() {
        if (this.props.data) {
            EventDispatcher.dispatch("onopenmodal" + MapWindow.modalName, this.props.data.concert.placeId);
        }
    }
  render() {
    return (
      <div className="ticket">
        <div>
          <p className="ticket-title">{this.props.data ? this.props.data.concert.performer:"Untitled"}</p>
          <div className="ticket-icon-text">
            <DateIcon/>
            <p>{this.props.data?this.formatDate(this.props.data.concert.concertDate):"Not Defined"}</p>
          </div>
          <div className="ticket-icon-text">
            <MapPointIcon/>
            <p>
                {this.props.data?this.props.data.concert.placeRoom:"Not Defined"}
            </p>
          </div>
          <div className="ticket-type-info">
            <p>Тип: {this.props.data?this.types[this.props.data.concert.type]:"Not Defined"}</p>
            {this.props.data?this.typeInfo:(<p>Not Defined</p>)}
          </div>
        </div>
        <div>
          <div className="ticket-icon-text small-text" onClick={this.openMap}>
            <p>Посмотреть на карте</p>
            <MapIcon/>
          </div>
          <div className="ticket-cancel-booking-button" onClick={ this.unbookTicket }>Отказаться от бронирования</div>
          <div className="booked-ticket-main-info">
          	{this.props.data && this.props.data.seat !== null?
            <div>{Math.floor(this.props.data.seat/100)+1} ряд {this.props.data.seat%100 + 1} кресло</div>:
        	null}
            <div>{this.props.data?
                        (this.props.data.promocode ?
                            Math.ceil(this.props.data.concert.ticketCost * (1 - this.props.data.promocode.discount) * 100)/100 :
                            this.props.data.concert.ticketCost) :
                "0"} BYN</div>
          </div>
        </div>
      </div>
    );
  }
}
