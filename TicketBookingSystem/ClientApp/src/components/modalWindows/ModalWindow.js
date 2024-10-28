import React, { Component } from 'react';
import EventDispatcher from '../services/EventDispatcher';
import "./styles.css";

export class ModalWindow extends Component {
    static displayName = ModalWindow.name;
    constructor(props) {
        super(props);
        this.state = {
            hidden: this.props.closed != null ? this.props.closed:true,
            data: null
        };
        this.closeModal = this.closeModal.bind(this);
        this.modalDidOpen = this.modalDidOpen.bind(this);
    }
    closeModal() {
        this.setState({ hidden: true, data: null }, () => {
            if (this.props.dataChanged) {
                this.props.dataChanged(this.state.data);
            }
        });
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
            EventDispatcher.subscribe("onopenmodal" + this.props.modalName, this.modalDidOpen);
        }
    }
    componentWillUnmount() {
        if (this.props.modalName) {
            EventDispatcher.unsubscribe("onopenmodal" + this.props.modalName, this.modalDidOpen);
        }
    }
    render() {
        if (this.state.hidden) return null;
        return (<div className="modal-window-container">
            <div className={"modal-window-background"} onClick={this.closeModal} />
            <div className={this.props.className ? this.props.className : "modal-window" }>
                <div className={"modal-window-title"}>{this.props.title}</div>
                <button className="modal-close-button" onClick={this.closeModal}>X</button>
                {this.props.children}
            </div>
        </div>);
    }
}