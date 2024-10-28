import React, { Component } from 'react';
import SessionManager from '../services/SessionManager';
import { ModalWindow } from "./ModalWindow.js";
import "./styles.css";

export class BookingWindow extends Component {
    static displayName = BookingWindow.name;
    static modalName = "bookingWindow";
    constructor(props) {
        super(props);
        this.state = {
            promocode: "",
            discount: 0,
            promocode_valid: false,
            error_message: "",
            ticket_data: null,
            bookied_seats: [],
            selected_seat: null,
            closed: true
        };
        this.promocodeValueChanged = this.promocodeValueChanged.bind(this);
        this.onOpenCloseWindow = this.onOpenCloseWindow.bind(this);
        this.selectBookedSeat = this.selectBookedSeat.bind(this);
        this.checkPromocode = this.checkPromocode.bind(this);
        this.bookTicket = this.bookTicket.bind(this);
    }
    promocodeValueChanged(e) {
        let promocode = e.target.value.toLocaleUpperCase().replaceAll(/[^A-Za-zА-Яа-я\d]/g, "");
        this.setState({ promocode: promocode.substring(0, 6) }, () => {
            if (this.state.promocode.length === 6 && promocode.length === 6) {
                this.checkPromocode(this.state.promocode);
            }
        });
    }
    onOpenCloseWindow(ticket_data) {
        if (ticket_data != null) {
            SessionManager.sendRequest("api/concert/bookiedseats", "POST", null, { concertId: ticket_data.id }).then(n => {
                this.setState({
                    ticket_data: ticket_data,
                    bookied_seats: n,
                    closed: false,
                });
            });
        } else {
            this.setState({
                promocode: "",
                ticket_data: ticket_data,
                bookied_seats: [],
                promocode_valid: false,
                selected_seat: null,
                error_message: "",
                discount: 0
            });
        }
    }
    checkPromocode(promocode) {
        SessionManager.sendRequest("/api/promocode/check", "GET", null, { code: promocode })
            .then(n => {
                if (n != null && n.available === "Y") {
                    if (n.concert === this.state.ticket_data.id || n.concertType === this.state.ticket_data.type)
                        this.setState({ promocode_valid: true, error_message: "", discount: n.discount });
                    else 
                        this.setState({ promocode_valid: true, error_message: "Данный промокод не распростанняется на этот билет", discount: 0 });
                } else {
                    this.setState({ promocode_valid: false, error_message: "Промокод не существует или деактивирован", discount:0 });
                }
            });
    }
    selectBookedSeat(seat) {
        this.setState({ selected_seat: seat });
    }
    bookTicket() {
        if (!SessionManager.hasUserSession()) {
            this.setState({ error_message: "Чтобы забронировать билет нужно войти в свою учётную запись" });
            return;
        }
        if (this.state.ticket_data) {
            if (this.state.ticket_data.seatsInRow != null && this.state.selected_seat == null) {
                this.setState({ error_message: "Для данного типа концерта требуется выбрать место в зале" });
                return;
            }
            SessionManager.sendRequest("/api/usertickets/book","POST", null, {
                concertId: this.state.ticket_data.id,
                seat: this.state.selected_seat,
                promocode: this.state.promocode_valid ? this.state.promocode : null
            }).then(n => {
                if (n) {
                    if (n.errors) {
                        this.setState({ error_message: n.errors[0] });
                        return;
                    }
                    this.setState({ closed: true });
                    alert("Билет на концерт " + n.concert + " успешно забронирован");
                    window.location.href = "/";
                } else {
                    this.setState({ error_message: "Сначало выполните вход в аккаунт" });
                    SessionManager.removeUserSession();
                }
            });
        }
    }
    render() {
        let seats = null;
        if (this.state.ticket_data && this.state.ticket_data.rowCounts) {
            seats = new Array(this.state.ticket_data.rowCounts);
            for (let i = 0; i < this.state.ticket_data.rowCounts; i++) {
                seats[i] = new Array(this.state.ticket_data.seatsInRow);
                for (let j = 0; j < this.state.ticket_data.seatsInRow; j++) {
                    seats[i][j] = {seat: 100*i+j, available: true};
                }
            }
            this.state.bookied_seats.forEach(n => { seats[Math.floor(n / 100)][n % 100].available = false; });
        }
        return (
            <ModalWindow title="Бронирование билета" closed={this.state.closed} modalName={BookingWindow.modalName} dataChanged={this.onOpenCloseWindow}>
                <h5>{this.state.ticket_data ? this.state.ticket_data.performer:null }</h5>
                <h6>Введите промокод на скидку</h6>
                <input className="booking-promocode-input" type="text" onChange={this.promocodeValueChanged} value={this.state.promocode} /><br/>
                <div>{
                    seats && seats.map((n, i) => {
                        return (<div className="seats-row" key={i}>{
                            n.map((k, j) => <div onClick={e=>this.selectBookedSeat(k.available?k.seat:null)} className={
                                "seat-button " + (k.available ?
                                    (this.state.selected_seat !== null && k.seat === this.state.selected_seat ? "selected-seat" : "book-seat-button") :
                                    "booked-seat-button")} key={j}>
                                {Math.floor(k.seat / 100)+1} ряд<br/> - {(k.seat % 100)+1} -
                            </div>)
                        }< br /></div>);
                    })
                }</div>
                <p>{this.state.selected_seat ?
                    (Math.floor(this.state.selected_seat / 100) + 1) + " ряд - " + ((this.state.selected_seat % 100) + 1) + " кресло" :
                        null
                }</p>
                <div>
                    <p>Цена: {this.state.ticket_data ?
                            (this.state.discount > 0 ?
                                (<s>{this.state.ticket_data.ticketCost} </s>)
                        : "")
                            : ""}
                        {this.state.ticket_data ?this.state.ticket_data.ticketCost * (1 - this.state.discount) : "0"} BYN
                    </p>
                </div>
                <p className="error-message">{this.state.error_message}</p>
                <button className="confirm-booking-button" onClick={this.bookTicket }>Забронировать</button>
            </ModalWindow>
        );
    }
}