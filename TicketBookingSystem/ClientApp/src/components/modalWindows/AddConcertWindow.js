import React, { Component } from 'react';
import SessionManager from '../services/SessionManager';
import { ModalWindow } from './ModalWindow';
import "./styles.css";

export class AddConcertWindow extends Component {
    static displayName = AddConcertWindow.name;
    static modalName = "AddConcertWindow";
    constructor(props) {
        super(props);
        this.state = {
            error_message: "",
            closed: true,
            performer: "",
            ticketsCount: 1,
            ticketCost: 0,
            concertType: "C",
            placeId: -1,
            places: [],
            placeAvailableTimes: [],
            concertDate: "",
            concertTime: "",
            concertData1: "",
            concertData2: "",
            maxTicketCount: 10000,
        };
        this.onOpenCloseWindow = this.onOpenCloseWindow.bind(this);
        this.addConcert = this.addConcert.bind(this);
        this.performerValueChanged = this.performerValueChanged.bind(this);
        this.ticketCountValueChanged = this.ticketCountValueChanged.bind(this);
        this.ticketCostValueChanged = this.ticketCostValueChanged.bind(this);
        this.concertTypeValueChanged = this.concertTypeValueChanged.bind(this);
        this.placeIdValueChanged = this.placeIdValueChanged.bind(this);
        this.concertData1ValueChanged = this.concertData1ValueChanged.bind(this);
        this.concertData2ValueChanged = this.concertData2ValueChanged.bind(this);
        this.concertDateValueChanged = this.concertDateValueChanged.bind(this);
        this.concertTimeValueChanged = this.concertTimeValueChanged.bind(this);
        this.getAvailableConcertTimesInDate = this.getAvailableConcertTimesInDate.bind(this);
        this.getPlaces = this.getPlaces.bind(this);
    }
    componentDidMount() {
        this.getPlaces("C");
    }
    concertDateValueChanged(e) {
        let concertDate = e.target.value;
        this.setState({ concertDate, concertTime:"" }, () => {this.getAvailableConcertTimesInDate() });
    }
    concertTimeValueChanged(e) {
        let concertTime = e.target.value;
        this.setState({ concertTime });
    }
    concertData1ValueChanged(e) {
        let concertData1 = e.target.value.substring(0, 20);
        if (this.state.concertType === "P") concertData1 = Math.min(Math.max(0, e.target.value), 100);
        this.setState({ concertData1 });
    }
    concertData2ValueChanged(e) {
        let concertData2 = e.target.value.substring(0, 20);
        this.setState({ concertData2 });
    }
    performerValueChanged(e) {
        let performer = e.target.value.substring(0, 20);
        this.setState({ performer });
    }
    ticketCountValueChanged(e) {
        let ticketsCount = Math.min(Math.max(1, e.target.value), this.state.maxTicketCount);
        this.setState({ ticketsCount });
    }
    ticketCostValueChanged(e) {
        let ticketCost = Math.min(Math.max(0, e.target.value),10000);
        this.setState({ ticketCost });
    }
    concertTypeValueChanged(e) {
        let concertType = e.target.value;
        this.setState({
            concertType,
            placeId: -1,
            concertDate: "",
            concertTime: "",
            placeAvailableTimes: [],
            places: [],
            concertData1: "",
            concertData2: "",
            maxTicketCount: 10000,
        },()=>this.getPlaces(concertType));
    }
    placeIdValueChanged(e) {
        let placeId = e.target.value;
        var placeIndex = this.state.places.findIndex(n => n.id === +placeId);
        let maxCount = 10000;
        if (placeIndex > -1) {
            var place = this.state.places[placeIndex];
            maxCount = place.rowCounts && place.seatsInRow ? place.seatsInRow * place.rowCounts : 1000000;
            maxCount = Math.min(99999, maxCount);
        }
        this.setState({ placeId, placeUsedDates: null, maxTicketCount: maxCount, ticketsCount: Math.min(this.state.ticketsCount, maxCount)});
    }
    onOpenCloseWindow(data) {
        if (data != null) {
            this.setState({
                closed: false,
            });
        } else {
            this.setState({
                closed: true,
                error_message: "",
            });
        }
    }
    getAvailableConcertTimesInDate() {
        if (this.state.placeId >= 0 && this.state.concertDate.length > 0) {
            SessionManager.sendRequest("/api/concert/AvailableConcertTimesInDate", "GET", null, {
                place: this.state.placeId,
                date: this.state.concertDate,
            }).then(n => {
                this.setState({ placeAvailableTimes: n.map(n => this.formatTime(n)) });
            });
        }
    }
    getPlaces(concertType) {
        if (concertType) {
            SessionManager.sendRequest("/api/place/list", "GET", null, {
                placeType: concertType
            }).then(n => {
                this.setState({ places: n });
            });
        }
    }
    formatTime(date) {
        let dateTime = new Date(date);
        let h = dateTime.getHours().toString();
        if (h.length < 2) h = "0" + h;
        let m = dateTime.getMinutes().toString();
        if (m.length < 2) m = "0" + m;
        return h + ":" + m;
    }
    tomorrowDate() {
        let date = new Date();
        var year = date.getFullYear().toString();
        while (year.length < 4) year = "0" + year;
        var mounth = (date.getMonth()+1).toString();
        if (mounth.length < 2) mounth = "0" + mounth;
        var day = (date.getDate()+1).toString();
        if (day.length < 2) day = "0" + day;
        return year + "-" + mounth + "-" + day;
    }

    addConcert() {
        if (this.state.performer.length === 0) {
            this.setState({ error_message: "Не задан исполнитель" });
            return;
        }
        if (this.state.placeId < 0) {
            this.setState({ error_message: "Не выбрано место проведения концерта" });
            return;
        }
        if (this.state.concertDate.length === 0) {
            this.setState({ error_message: "Не выбрана дата концерта" });
            return;
        }
        if (this.state.concertTime.length === 0) {
            this.setState({ error_message: "Не выбрано время концерта" });
            return;
        }
        let data = "";
        if (this.state.concertType === "C") {
            if (this.state.concertData1.length === 0) {
                this.setState({ error_message: "Не выбран тип вокала" });
                return;
            }
            if (this.state.concertData2.length === 0) {
                this.setState({ error_message: "Не задан композитор" });
                return;
            }
            data = "Тип вокала: " + this.state.concertData1 + ";Композитор: " + this.state.concertData2;
        }
        if (this.state.concertType === "O") {
            if (this.state.concertData1.length === 0) {
                this.setState({ error_message: "Не задан Хэдлайнер концерта" });
                return;
            }
            data = "Хэдлайнер: " + this.state.concertData1;;
        }
        if (this.state.concertType === "P") {
            if (this.state.concertData1.length === 0) {
                this.setState({ error_message: "Не задано возрастное ограничение" });
                return;
            }
            data = "Возрастной цензор: " + this.state.concertData1 + "+";
        }
        SessionManager.sendRequest("/api/Concert/Add", "POST", null, {
            performer: this.state.performer,
            place: this.state.placeId,
            concertDate: this.state.concertDate+" "+this.state.concertTime,
            ticketsCount: this.state.ticketsCount,
            ticketCost: this.state.ticketCost,
            data: data,
        }).then(n => {
                if (n.errors) {
                    this.setState({ error_message: n.errors[0] });
                    return;
                }
                alert("Концерт успешно добавлен");
                window.location.href = "/panel";
            });
    }

    render() {
        return (
            <ModalWindow title="Добавить концерт" closed={this.state.closed} modalName={AddConcertWindow.modalName} dataChanged={this.onOpenCloseWindow}>
                <div className="input-row"><p>Исполнитель: </p>
                    <input type="text" value={this.state.performer} onChange={this.performerValueChanged} /><sup>*</sup></div>
                <div className="input-row"><p>Кол-во билетов: </p>
                    <input type="number" min="1" value={this.state.ticketsCount} onChange={this.ticketCountValueChanged} /><sup>*</sup></div>
                <div className="input-row"><p>Тип концерта: </p>
                    <select onChange={this.concertTypeValueChanged} value={this.state.concertType}>
                        <option value="C">Класическая музыка</option>
                        <option value="P">Вечеринка</option>
                        <option value="O">Опэнэир</option>
                    </select>
                    <sup>*</sup>
                </div>
                <div className="input-row"><p>Адрес проведения концерта: </p>
                    <select onChange={this.placeIdValueChanged} value={this.state.placeId}>
                        <option disabled value={-1}>Выберите место проведения</option>
                        {this.state.places ? this.state.places.map(n => <option key={n.id} value={n.id}>{n.placeRoom}</option>):null}
                    </select>
                    <sup>*</sup></div>
                <div className="input-row double-row">
                    <p>Дата концерта: </p>
                    <input type="date" value={this.state.concertDate} disabled={ this.state.placeId === -1 } min={this.tomorrowDate() } onChange={ this.concertDateValueChanged } /><sup>*</sup>
                    <p>Время концерта: </p>
                    <select type="text" value={this.state.concertTime} disabled={this.state.concertDate.length === 0} onChange={this.concertTimeValueChanged}>
                        <option disabled value={""}>Выберите время концерта</option>
                        {this.state.placeAvailableTimes ?
                            this.state.placeAvailableTimes.map(n => <option key={n} value={n}>{n}</option>) :
                         null}
                    </select>
                    <sup>*</sup>
                </div>
                <div className="input-row"><p>Цена билета (BYN): </p>
                    <input type="number" min="0" max="10000" step="0.01" value={this.state.ticketCost} onChange={this.ticketCostValueChanged} /><sup>*</sup></div>
                {this.state.concertType === "O" ?
                    <div className="input-row"><p>Хэдлайнер: </p><input type="text" value={this.state.concertData1} onChange={this.concertData1ValueChanged} /><sup>*</sup></div> :
                 this.state.concertType === "P" ?
                        <div className="input-row"><p>Возрастное ограничение (от X лет): </p>
                            <input type="number" min="0" max="100" value={this.state.concertData1} onChange={this.concertData1ValueChanged} /><sup>*</sup></div> :
                 this.state.concertType === "C" ?
                            <div className="input-row double-row">
                                <p>Тип вокала: </p>
                                <select value={this.state.concertData1} onChange={this.concertData1ValueChanged} >
                                    <option disabled value="">Выберите тип вокала</option>
                                    <option value="Сопрано">Сопрано</option>
                                    <option value="Альт">Альт</option>
                                    <option value="Тенор">Тенор</option>
                                    <option value="Басс">Басс</option>
                                </select>
                                <sup>*</sup>
                                <p>Композитор: </p><input type="text" value={this.state.concertData2} onChange={ this.concertData2ValueChanged } /><sup>*</sup>
                            </div> : null
                }
                <p className="error-message">{this.state.error_message}</p>
                <div className="confirm-modal-button-container">
                    <button className="confirm-booking-button" onClick={this.addConcert}>Добавить</button>
                </div>
            </ModalWindow>
        );
    }
}