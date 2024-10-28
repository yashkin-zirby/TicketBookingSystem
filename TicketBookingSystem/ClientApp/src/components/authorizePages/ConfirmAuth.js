import React, { Component } from 'react';
import SessionManager from "../services/SessionManager.js";
import "./AuthStyles.css";

export class ConfirmAuth extends Component {
    static displayName = ConfirmAuth.name;

    constructor(props) {
        super(props);
        this.state = {
            error: ""
        };
        this.checkUserClaims = this.checkUserClaims.bind(this);
    }
    componentDidMount() {
        this.checkUserClaims();
    }
    async checkUserClaims() {
        let error = "";
        await SessionManager.checkAuth().then(n => {
            if (n.errors) {
                error = n.errors[0];
            } else {
                SessionManager.setUserSession(n);
                window.location.href = n.url;
            }
        }).catch(e => { alert(e); setTimeout(() => {window.location.href="/auth/login"; },3000) });
        this.setState({
            error: error
        });
    }
    render() {
        return (
            <div className="auth-form">
                <p className="page-title">Подождите идёт проверка</p>
                <div className="form-error-message">{this.state.error}</div>
            </div>
        );
    }
}
