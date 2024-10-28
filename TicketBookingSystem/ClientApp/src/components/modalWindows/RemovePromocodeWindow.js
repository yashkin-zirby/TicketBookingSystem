import { Component } from "react";
import SessionManager from '../services/SessionManager';
import { ConfirmModalWindow } from "./ConfirmModalWindow";
import "./styles.css";

export class RemovePromocodeWindow extends Component{
    static displayName = RemovePromocodeWindow.name;
    static modalName = "RemovePromocodeWindow";
    constructor(props) {
        super(props);
        this.state = {data: null};
        this.confirmRemovePromocode = this.confirmRemovePromocode.bind(this);
        this.onOpen = this.onOpen.bind(this);
    }
    onOpen(data) {
        this.setState({ data: data });
    }
    async confirmRemovePromocode(data) {
        await SessionManager.sendRequest("/api/Promocode/remove", "DELETE", null, { code: data }).then(n => {
            if (n.errors) {
                alert(n.errors[0]);
                return;
            } 
            alert("Промокод успешно деактивирован");
            window.location.href = "/panel";
        });
    }
    render() {
        return <ConfirmModalWindow dataChanged={this.onOpen} modalName={RemovePromocodeWindow.modalName} title="Отмена бронирования" onOk={this.confirmRemovePromocode}
            text={"Вы уверены что хотите деактивировать промокод\n "+this.state.data}>
        </ConfirmModalWindow>
    }
}