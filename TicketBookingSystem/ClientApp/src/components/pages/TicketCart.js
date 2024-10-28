import React, { Component } from 'react';
import EventDispatcher from "../services/EventDispatcher.js";
import SessionManager from "../services/SessionManager.js";
import { BookedTicket } from '../ticketComponents/BookedTicket.js';
import "./PagesStyles.css";

export class TicketCart extends Component {
    static displayName = TicketCart.name;
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            pagesCount: 1,
            tickets: [],
            selected: false,
            filters: null
        };
        this.selectTickets = this.selectTickets.bind(this);
        this.selectPage = this.selectPage.bind(this);
        this.generatePaging = this.generatePaging.bind(this);
    }
    selectPage(page) {
        this.setState({ page: page }, () => { this.selectTickets(this.state.filters); });
    }
    selectTickets(filters = null) {
        SessionManager.sendRequest("api/usertickets/list", "GET", null, {page: this.state.page}, filters&&filters.detail)
            .then((n) => { this.setState({ tickets: n.tickets, page: n.page, pagesCount: n.pagesCount, selected: true, filters }); })
            .catch(e => alert(e));
    }
    componentDidMount() {
        this.selectTickets();
        EventDispatcher.subscribe("onUserSetSearchFilters", this.selectTickets);
    }
    componentWillUnmount() {
        EventDispatcher.unsubscribe("onUserSetSearchFilters", this.selectTickets);
    }
    generatePaging(page, count) {
        if (count <= 7) return [...Array(count).keys()].map(n => <div key={"paging"+(n+1)} className={this.state.page === n + 1 ? "current-page" : ""} onClick={() => this.selectPage(n + 1)}>{n + 1}</div>);
        let result = [];
        result.push(<div className={page === 1 ? "current-page" : ""} onClick={() => this.selectPage(1)}>1</div>);
        if (page > 4) {
            result.push(<p>...</p>);
        }
        let val = page < 5 ? 2 : page > count - 4 ? count - 5 : page - 2;
        for (let i = 0; i < 5; i++) {
            result.push(<div className={page === val + i ? "current-page" : ""} onClick={() => this.selectPage(val + i)}>{val+i}</div>);
        }
        if (page < count - 3) {
            result.push(<p>...</p>);
        }
        result.push(<div className={page === count ? "current-page" : ""} onClick={() => this.selectPage(count)}>{count}</div>);
        return result;
    }
    render() {
        if (!SessionManager.hasUserSession()) {
            SessionManager.checkAuth().then(n => {
                if (n.errors) {
                    alert(n.errors[0]);
                    window.location.href = "/auth/login"; 
                } else {
                    SessionManager.setUserSession(n.username, n.claims);
                    this.selectTickets(this.state.filters);
                }
            }).catch(e => { alert(e); window.location.href = "/auth/login"; });
        }
        return (
            <div className="page">
                <p className="page-title">Ваши билеты:</p>
                <div className="flex-with-wrap">
                    {!this.state.selected ?
                        <p>Идёт загрузка...</p> :
                        this.state.tickets.map(n => <BookedTicket key={n.id } data={ n } />)
                    }
                </div>
                <div className="paging-container">
                    {this.generatePaging(this.state.page, this.state.pagesCount)}
                </div>
            </div>
        );
    }
}