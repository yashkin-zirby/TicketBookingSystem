import React, { Component } from 'react';
import SessionManager from '../services/SessionManager';
import { ModalWindow } from './ModalWindow';
import "./styles.css";

export class AddPromocodeWindow extends Component {
    static displayName = AddPromocodeWindow.name;
    static modalName = "AddPromocodeWindow";
    constructor(props) {
        super(props);
        this.state = {
            error_message: "",
            closed: true,
            code: "",
            concertId: "",
            concertType: "",
            discount: 0,
        };
        this.onOpenCloseWindow = this.onOpenCloseWindow.bind(this);
        this.addPromocode = this.addPromocode.bind(this);
        this.promocodeValueChanged = this.promocodeValueChanged.bind(this);
        this.discountValueChanged = this.discountValueChanged.bind(this);
        this.concertTypeValueChanged = this.concertTypeValueChanged.bind(this);
        this.concertValueChanged = this.concertValueChanged.bind(this);
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
                code: "",
                concertId: "",
                concertType: "",
                discount: 0,
            });
        }
    }
    promocodeValueChanged(e) {
        let code = e.target.value.toLocaleUpperCase().replaceAll(/[^A-Za-zА-Яа-я\d]/g, "");
        this.setState({ code: code.substring(0, 6) });
    }
    discountValueChanged(e) {
        let discount = Math.floor(Math.min(10000,Math.max(0,e.target.value*100)))/100;
        this.setState({ discount: discount});
    }
    concertTypeValueChanged(e) {
        let concertType = e.target.value;
        this.setState({ concertType: concertType});
    }
    concertValueChanged(e) {
        let concert = e.target.value < 0 ? "" : e.target.value;
        this.setState({ concertId: concert });
    }
    addPromocode() {
        this.setState({ error_message: "" });
        if (this.state.code.length !== 6) {
            this.setState({ error_message: "Не задан промокод" });
            return;
        }
        if (this.state.concertId === null && this.state.concertType.length === 0) {
            this.setState({ error_message: "Не задан концерт или тип концерта" });
            return;
        }
        SessionManager.sendRequest("/api/Promocode/Add", "POST", null, {
            code: this.state.code,
            concertId: this.state.concertId,
            concertType: this.state.concertType,
            discount: this.state.discount/100,
        }).then(n => {
                if (n.errors) {
                    this.setState({ error_message: n.errors[0] });
                    return;
                }
                alert("Промокод добавлен");
                window.location.href = "/panel";
            });
    }

    render() {
        return (
            <ModalWindow title="Добавить промокод" closed={this.state.closed} modalName={AddPromocodeWindow.modalName} dataChanged={this.onOpenCloseWindow}>
                <div className="input-row"><p>Промокод: </p>
                    <input className="booking-promocode-input input-200px" type="text" onChange={this.promocodeValueChanged} value={this.state.code} /><br />
                    <sup>*</sup>
                </div>
                <div className="input-row"><p>Тип концерта: </p>
                    <select className="not-required" onChange={this.concertTypeValueChanged} value={this.state.concertType}>
                        <option disabled value="">Выберите тип концерта</option>
                        <option value="C">Класическая музыка</option>
                        <option value="P">Вечеринка</option>
                        <option value="O">Опэнэир</option>
                    </select>
                </div>
                <div className="input-row">
                    <p>Id Концерта: </p>
                    <input className="not-required input-200px" type="number" min="-1" step="1" value={this.state.concertId} onChange={this.concertValueChanged} />
                </div>
                <div className="input-row"><p>Скидка (%): </p>
                    <input className="input-200px" type="number" min="0" max="100" step="0.01" value={this.state.discount} onChange={this.discountValueChanged} /><sup>*</sup></div>
                <p className="error-message">{this.state.error_message}</p>
                <div className="confirm-modal-button-container">
                    <button className="confirm-booking-button" onClick={this.addPromocode}>Добавить</button>
                </div>
            </ModalWindow>
        );
    }
}