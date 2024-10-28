import React, { Component } from 'react';
import EventDispatcher from "../services/EventDispatcher.js";
import SessionManager from "../services/SessionManager.js";
import { RemoveConcertWindow } from "../modalWindows/RemoveConcertWindow.js";
import { AddConcertWindow } from "../modalWindows/AddConcertWindow.js";
import { RemovePromocodeWindow } from "../modalWindows/RemovePromocodeWindow.js";
import { AddPromocodeWindow } from "../modalWindows/AddPromocodeWindow.js";
import "./PagesStyles.css";
import "./TabsStyles.css";


export class Panel extends Component {
    static displayName = Panel.name;
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            pagesCount: 1,
            selectedTab: 1,
            data: [],
            selectedRowId: null,
        };
        this.types = { "O": "Опенэир", "C": "Классическая музыка", "P": "Вечеринка" }
        this.status = { "A": "Активный", "P": "Прошёл", "D": "Удалён" }
        this.statusColor = { "A": "green", "P": "yellow", "D": "red" }
        this.selectData = this.selectData.bind(this);
        this.selectPage = this.selectPage.bind(this);
        this.generatePaging = this.generatePaging.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.selectRow = this.selectRow.bind(this);
        this.addConcert = this.addConcert.bind(this);
        this.removeConcert = this.removeConcert.bind(this);
        this.addPromocode = this.addPromocode.bind(this);
        this.removePromocode = this.removePromocode.bind(this);
    }
    formatDate(date) {
        let h = date.getHours().toString();
        let m = date.getMinutes().toString();
        return date.toLocaleDateString() + " " + (h.length < 2 ? "0" + h : h) + ":" + (m.length < 2 ? "0" + m : m);
    }
    selectPage(page) {
        this.setState({ page: page, selectedRowId:null }, () => { this.selectData(this.state.filters); });
    }
    selectData() {
        if (this.state.selectedTab === 1)
            SessionManager.sendRequest("api/concert/all", "GET", null, { page: this.state.page })
                .then((n) => { this.setState({ data: n.concerts, page: n.page, pagesCount: n.pagesCount }); })
                .catch(e => alert(e));
        if (this.state.selectedTab === 2)
            SessionManager.sendRequest("api/promocode/all", "GET", null, { page: this.state.page })
                .then((n) => { this.setState({ data: n.promocodes, page: n.page, pagesCount: n.pagesCount }); })
                .catch(e => alert(e));
    }
    componentDidMount() {
        this.selectData();
    }
    generatePaging(page, count) {
        if (count <= 7) return [...Array(count).keys()].map(n => <div key={"paging" + (n + 1)} className={this.state.page === n + 1 ? "current-page" : ""} onClick={() => this.selectPage(n + 1)}>{n + 1}</div>);
        let result = [];
        result.push(<div key={1} className={page === 1 ? "current-page" : ""} onClick={() => this.selectPage(1)}>1</div>);
        if (page > 4) {
            result.push(<p key="dots1">...</p>);
        }
        let val = page < 5 ? 2 : page > count - 4 ? count - 5 : page - 2;
        for (let i = 0; i < 5; i++) {
            result.push(<div key={val+i} className={page === val + i ? "current-page" : ""} onClick={() => this.selectPage(val + i)}>{val + i}</div>);
        }
        if (page < count - 3) {
            result.push(<p key="dots2">...</p>);
        }
        result.push(<div key={count} className={page === count ? "current-page" : ""} onClick={() => this.selectPage(count)}>{count}</div>);
        return result;
    }
    selectTab(tab) {
        this.setState({ selectedTab: tab, selectedRowId: null, data: [], page: 1 }, () => this.selectData());
    }
    selectRow(id) {
        this.setState({ selectedRowId: id });
    }
    addConcert() {
        EventDispatcher.dispatch("onopenmodal" + AddConcertWindow.modalName, {});
    }
    removeConcert() {
        if (this.state.selectedRowId) {
            EventDispatcher.dispatch("onopenmodal" + RemoveConcertWindow.modalName, this.state.selectedRowId);
        } else {
            alert("Сначало выберите строку которую хотите удалить");
        }
    }
    addPromocode() {
        EventDispatcher.dispatch("onopenmodal" + AddPromocodeWindow.modalName, {});
    }
    removePromocode() {
        if (this.state.selectedRowId) {
            EventDispatcher.dispatch("onopenmodal" + RemovePromocodeWindow.modalName, this.state.selectedRowId);
        } else {
            alert("Сначало выберите строку которую хотите удалить");
        }
    }
    render() {
        if (!SessionManager.checkPermission(SessionManager.permissions.can_use_manager_panel)) {
            return (
                <div className="flex-with-wrap">
                    <h1>Доступ запрещён: недостаточно прав</h1>
                </div>
            );
        }
        return (
            <div>
                <div className="tabs">
                    <button className={"tab-link" + (this.state.selectedTab === 1 ? " selected-tab" : "")} onClick={()=>this.selectTab(1)}>Концерты</button>
                    <button className={"tab-link" + (this.state.selectedTab === 2 ? " selected-tab" : "")} onClick={()=>this.selectTab(2)}>Промокоды</button>
                </div>
                {this.state.selectedTab === 1 ? (
                    <div className="tab-data">
                        <table className="tab-table">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Исполнитель</th>
                                    <th>Кол-во билетов</th>
                                    <th>Макс. Кол-во билетов</th>
                                    <th>Дата проведения</th>
                                    <th>Тип концерта</th>
                                    <th>Цена</th>
                                    <th>Информация о концерте</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.data ? this.state.data.map(n => (
                                    <tr key={n.id} className={this.state.selectedRowId === n.id ? "active-row" : ""} onClick={() => this.selectRow(n.id)}>
                                        <td>{n.id}</td>
                                        <td>{n.performer}</td>
                                        <td>{n.ticketsCount}</td>
                                        <td>{n.maxTicketsCount}</td>
                                        <td>{this.formatDate(new Date(n.concertDate))}</td>
                                        <td>{this.types[n.type]}</td>
                                        <td>{n.ticketCost}</td>
                                        <td>{n.concertData}</td>
                                        <td className={this.statusColor[n.status]}>{this.status[n.status]}</td>
                                    </tr>
                                )) : null}
                            </tbody>
                        </table>
                    </div>
                ) : this.state.selectedTab === 2 ? (
                    <div className="tab-data">
                        <table className="tab-table">
                            <thead>
                                <tr>
                                    <th>Код</th>
                                    <th>Скидка, %</th>
                                    <th>Концерт на который идёт скидка</th>
                                    <th>Тип концерта на который идёт скидка</th>
                                    <th>Промокод действителен</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.data ? this.state.data.map(n => (
                                    <tr key={n.code} className={this.state.selectedRowId === n.code ? "active-row" : ""} onClick={() => this.selectRow(n.code)}>
                                        <td>{n.code}</td>
                                        <td>{n.discount*100}</td>
                                        <td>{n.concert ? n.concert.performer+" - "+this.formatDate(new Date(n.concert.concertDate)):""}</td>
                                        <td>{this.types[n.concertType]}</td>
                                        <td className={n.available === "Y" ?"green":"red" }>{n.available === "Y"?"Да":"Нет"}</td>
                                    </tr>
                                )) : null}
                            </tbody>
                        </table>
                    </div>
                ) : null}
                <div className="tab-paging-container">
                    {this.generatePaging(this.state.page, this.state.pagesCount)}
                </div>
                {this.state.selectedTab === 1 ?<div className="tab-buttons-container">
                    <button onClick={ this.addConcert }>Добавить Концерт</button>
                    <button onClick={this.removeConcert}>Удалить концерт</button>
                </div> :
                <div className="tab-buttons-container">
                    <button onClick={this.addPromocode}>Добавить Промокод</button>
                    <button onClick={this.removePromocode}>Деактевировать Промокод</button>
                </div>}
            </div>
        );
    }
}