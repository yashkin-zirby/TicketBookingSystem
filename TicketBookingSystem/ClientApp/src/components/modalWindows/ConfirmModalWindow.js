import React, { Component } from 'react';
import EventDispatcher from '../services/EventDispatcher';
import "./styles.css";

export class ConfirmModalWindow extends Component {
    static displayName = ConfirmModalWindow.name;
    constructor(props) {
        super(props);
        this.state = {
            hidden: this.props.closed != null ? this.props.closed : true,
            data: null
        };
        this.closeModal = this.closeModal.bind(this);
        this.modalDidOpen = this.modalDidOpen.bind(this);
        this.clickOk = this.clickOk.bind(this);
    }
    closeModal() {
        this.setState({ hidden: true, data: null }, () => {
            if (this.props.dataChanged) {
                this.props.dataChanged(this.state.data);
            }
        });
    }
    async clickOk() {
        if (this.props.onOk) {
            await this.props.onOk(this.state.data);
        }
        this.closeModal();
    }
    modalDidOpen(e) {
        this.setState({ hidden: false, data: e.detail }, () => {
            if (this.props.dataChanged) {
                this.props.dataChanged(this.state.data);
            }
        });
    }
    componentDidMount() {
        if (this.props.modalName) {
            let modalName = this.props.modalName ? this.props.modalName : ConfirmModalWindow.modalName;
            EventDispatcher.subscribe("onopenmodal" + modalName, this.modalDidOpen);
        }
    }
    componentWillUnmount() {
        if (this.props.modalName) {
            let modalName = this.props.modalName ? this.props.modalName : ConfirmModalWindow.modalName;
            EventDispatcher.unsubscribe("onopenmodal" + modalName, this.modalDidOpen);
        }
    }
    render() {
        if (this.state.hidden) return null;
        return (<div className="modal-window-container">
            <div className={"modal-window-background"} onClick={this.closeModal} />
            <div className={this.props.className ? this.props.className : "confirm-modal-window"}>
                <div className={"modal-window-title"}>{this.props.title}</div>
                <button className="modal-close-button" onClick={this.closeModal}>X</button>
                <pre>{this.props.text}</pre>
                <div className="confirm-modal-button-container">
                    <button className="confirm-modal-button" onClick={this.clickOk}>Ok</button>
                    <button className="confirm-modal-button" onClick={this.closeModal}>Cancel</button>
                </div>
            </div>
        </div>);
    }
}