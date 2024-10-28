import React, { Component } from 'react';
import {ReactComponent as MapIcon} from "../assets/map-icon.svg";
import {ReactComponent as DateIcon} from "../assets/date-icon.svg";
import {ReactComponent as MapPointIcon} from "../assets/map-point.svg";
import {ReactComponent as TicketsIcon} from "../assets/tickets-icon.svg";
import './TicketsStyles.css';
import EventDispatcher from '../services/EventDispatcher';
import { BookingWindow } from '../modalWindows/BookingWindow';
import { MapWindow } from '../modalWindows/MapWindow';
export class Ticket extends Component {
  static displayName = Ticket.name;

    constructor(props) {
      super(props);
      if(this.props.data){
        let data = this.props.data.concertData.split("\n");
        this.typeInfo = data.map(n=><p key={n}>{n}</p>);
      }
      this.types = {"O": "Опенэир", "C": "Классическая музыка", "P":"Вечеринка"}
      this.clickBooking = this.clickBooking.bind(this);
      this.openMap = this.openMap.bind(this);
    }
    formatDate(date) {
        let h = date.getHours().toString();
        let m = date.getMinutes().toString();
        return date.toLocaleDateString() + " " + (h.length < 2 ? "0" + h : h) + ":" + (m.length < 2 ? "0" + m : m);
    }
    async clickBooking() {
        if (this.props.data) {
            EventDispatcher.dispatch("onopenmodal"+BookingWindow.modalName, this.props.data);
        }
    }
    openMap() {
        if (this.props.data) {
            EventDispatcher.dispatch("onopenmodal" + MapWindow.modalName, this.props.data.placeId);
        }
    }
  render() {
    return (
      <div className="ticket">
        <div>
          <p className="ticket-title">{this.props.data?this.props.data.performer:"Untitled"}</p>
          <div className="ticket-icon-text">
            <DateIcon/>
            <p>{this.props.data ? this.formatDate(new Date(this.props.data.concertDate)) :"Not Defined"}</p>
          </div>
          <div className="ticket-icon-text">
            <MapPointIcon/>
            <p>{this.props.data?this.props.data.placeRoom:"Not Defined"}</p>
          </div>
          <div className="ticket-type-info">
            <p>Тип: {this.props.data?this.types[this.props.data.type]:"Not Defined"}</p>
            {this.props.data?this.typeInfo:(<p>Not Defined</p>)}
          </div>
        </div>
        <div>
          <div className="ticket-icon-text small-text" onClick={this.openMap}>
            <p>Посмотреть на карте</p>
            <MapIcon/>
          </div>
          <div className="ticket-buy-button" onClick={this.clickBooking}>Забронировать</div>
          <div className="ticket-main-info">
            <div>{this.props.data ? this.props.data.ticketCost : "0"} BYN</div>
            {this.props.data && this.props.data.ticketsCount ? 
              <div>билетов: {this.props.data.ticketsCount}<TicketsIcon/></div> :
              <div className="red">билетов нет<TicketsIcon/></div>
            }
          </div>
        </div>
      </div>
    );
  }
}
