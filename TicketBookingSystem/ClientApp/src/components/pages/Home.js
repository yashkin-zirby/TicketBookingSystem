import React, { Component } from 'react';
import EventDispatcher from "../services/EventDispatcher.js";
import SessionManager from "../services/SessionManager.js";
import { Ticket } from '../ticketComponents/Ticket.js';
import "./PagesStyles.css";

export class Home extends Component {
    static displayName = Home.name;
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
        SessionManager.sendRequest("api/concert/list", "GET", null, {page: this.state.page}, filters&&filters.detail)
            .then((n) => {if(n) this.setState({ tickets: n.concerts, page: n.page, pagesCount: n.pagesCount, selected: true, filters }); })
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
        if (SessionManager.checkPermission(SessionManager.permissions.can_use_manager_panel)) window.location.href = "/panel";
        return (
            <div className="page">
                <div className="flex-with-wrap">
                    {!this.state.selected ? "...Загрузка" : this.state.tickets.length === 0? <p>Ничего не найдено</p>:this.state.tickets.map((x) => <Ticket key={x.id} data={x} />)}
                </div>
                <div className="paging-container">
                    {
                        this.generatePaging(this.state.page, this.state.pagesCount)
                    }
                </div>
                
            </div>
        );
    }
}