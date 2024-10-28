import { Component } from "react";
import SessionManager from '../services/SessionManager';
import { ConfirmModalWindow } from "./ConfirmModalWindow";
import "./styles.css";

export class ConfirmUnbookingWindow extends Component{
    static displayName = ConfirmUnbookingWindow.name;
    static modalName = ConfirmUnbookingWindow.name;
    constructor(props) {
        super(props);
        this.confirmUnbooking = this.confirmUnbooking.bind(this);
    }
    async confirmUnbooking(data) {
        await SessionManager.sendRequest("/api/usertickets/unbook", "DELETE", null, { ticketId: data.id }).then(n => {
            if (n.errors) {
                alert(n.errors[0]);
                return;
            } 
            if (n.concert_id) {
                alert("Бронирование билета успешно отменено");
                window.location.href = "/tickets-cart";
            }
        });
    }
    render() {
        return <ConfirmModalWindow modalName={ConfirmUnbookingWindow.modalName} title="Отмена бронирования" onOk={this.confirmUnbooking}
            text={"Вы уверены что хотите отказаться от бронирования билета?\nДанное действие отменить нельзя."}>
        </ConfirmModalWindow>
    }
}