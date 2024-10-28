import React, { Component } from 'react';
import {ReactComponent as MapIcon} from "../assets/map-icon.svg";
import {ReactComponent as DateIcon} from "../assets/date-icon.svg";
import {ReactComponent as MapPointIcon} from "../assets/map-point.svg";
import {ReactComponent as TicketsIcon} from "../assets/tickets-icon.svg";
import './TicketsStyles.css';
export class InfoTicket extends Component {
    static displayName = InfoTicket.name;

    constructor(props) {
      super(props);
      this.statusClassName = {"P":"green","C": "orange", "D": "red"};
      this.types = {"O": "Опенэир", "C": "Классическая музыка", "P":"Вечеринка"};
    }
    formatDate(date) {
        let h = date.getHours().toString();
        let m = date.getMinutes().toString();
        return date.toLocaleDateString() + " " + (h.length < 2 ? "0" + h : h) + ":" + (m.length < 2 ? "0" + m : m);
    }
    getConcertDisplayStatus(status, date) {
        if (status === "P") return "Посещён";
        if (status === "D") return "Удалён";
        if (new Date(date).getTime() > new Date().getTime()) return "Отменён";
        return "Пропущен";
    }
  render() {
    return (
      <div className="ticket ticket-info">
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
            </div>
        <div>
            <div className={"ticket-status " + this.statusClassName[this.props.data.ticketStatus]}>
                {this.props.data ? this.getConcertDisplayStatus(this.props.data.ticketStatus, this.props.data.concertDate) : null}
            </div>
            <div className="ticket-main-info">
                <div>{this.props.data ? this.props.data.ticketCost : "0"} BYN</div>
            </div>
        </div>
      </div>
    );
  }
}
