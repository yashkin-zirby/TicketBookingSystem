import React, { Component } from 'react';
import SessionManager from '../services/SessionManager';
import { ModalWindow } from './ModalWindow';
import "./styles.css";

export class RemoveConcertWindow extends Component {
    static displayName = RemoveConcertWindow.name;
    static modalName = "RemoveConcertWindow";
    constructor(props) {
        super(props);
        this.state = {
            error_message: "",
            concertId: null,
            message: "",
            closed: true
        };
        this.onOpenCloseWindow = this.onOpenCloseWindow.bind(this);
        this.deleteConcert = this.deleteConcert.bind(this);
        this.messageValueChanged = this.messageValueChanged.bind(this);
    }
    onOpenCloseWindow(data) {
        if (data != null) {
            this.setState({
                concertId: data,
                closed: false,
            });
        } else {
            this.setState({
                concertId: data,
                error_message: "",
                message: "",
            });
        }
    }
    messageValueChanged(e) {
        this.setState({ message: e.target.value });
    }
    deleteConcert() {
        this.setState({ error_message: "" });
        if (this.state.message.length < 10) {
            this.setState({ error_message: "Слишком короткое сообщение" });
            return;
        }
        SessionManager.sendRequest("/api/concert/remove", "DELETE", null, {
            id: this.state.concertId,
            message: this.state.message
        }).then(n => {
            if (n.errors) {
                this.setState({ error_message: n.errors[0] });
                return;
            }
            alert("Концерт успешно удалён");
            window.location.href = "/panel";
        })
    }
    render() {
        return (
            <ModalWindow title="Удалить концерт" closed={this.state.closed} modalName={RemoveConcertWindow.modalName} dataChanged={this.onOpenCloseWindow}>
                <p className="alert-message"> Если вы хотите удалить концерт, пользователям купившим билет будет отправлен email c указанием причины отмены концерта.
                </p>
                <p className="title-text">
                Введите причину отмены концерта
                </p>
                <div className="modal-textarea">
                    <textarea onChange={this.messageValueChanged} value={this.state.message }></textarea>
                    <sup>*</sup>
                </div>
                <p className="error-message">{this.state.error_message}</p>
                <div className="confirm-modal-button-container">
                    <button className="confirm-booking-button" onClick={this.deleteConcert}>Удалить концерт</button>
                </div>
            </ModalWindow>
        );
    }
}