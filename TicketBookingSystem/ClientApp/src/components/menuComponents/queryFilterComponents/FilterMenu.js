import React, { Component } from 'react';
import SessionManager from "../../services/SessionManager.js";
import './FilterStyles.css';
export class FilterMenu extends Component {
  static displayName = FilterMenu.name;
  constructor(props) {
      super(props);
      this.showStatusFilter = SessionManager.checkPermission(SessionManager.permissions.can_use_manager_panel) && 
                              window.location.pathname.startsWith("/panel");
      this.state = {
        isOpen: false,
        concertType: '',
        beginDate: '',
        endDate: '',
        startPrice: '',
        endPrice: '',
        concertStatus: (this.showStatusFilter ?'':'A'),
      };
      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.changeConcertType = this.changeConcertType.bind(this);
      this.changeBeginDate = this.changeBeginDate.bind(this);
      this.changeEndDate = this.changeEndDate.bind(this);
      this.changeStartPrice = this.changeStartPrice.bind(this);
      this.changeEndPrice = this.changeEndPrice.bind(this);
      this.changeConcertStatus = this.changeConcertStatus.bind(this);
  }
  open(){
    this.setState({
      isOpen: true
    });
  }
  close(){
    this.setState({
      isOpen: false
    });
    if(this.state.isOpen && this.props.onUpdateFilter){
      this.props.onUpdateFilter({
        concertType : this.state.concertType,
        beginDate : this.state.beginDate,
        endDate : this.state.endDate,
        startPrice : this.state.startPrice,
        endPrice : this.state.endPrice,
        concertStatus: this.state.concertStatus
      });
    }
  }
  changeConcertType(e){
    this.setState({
      concertType: e.target[e.target.selectedIndex].value
    });
  }
  changeBeginDate(e){
    this.setState({
      beginDate: e.target.value
    });
  }
  changeEndDate(e){
    this.setState({
      endDate: e.target.value
    });
  }
  changeStartPrice(e){
    this.setState({
      startPrice: e.target.value
    });
  }
  changeEndPrice(e){
    this.setState({
      endPrice: e.target.value
    });
  }
  changeConcertStatus(e){
    this.setState({
      concertStatus: e.target[e.target.selectedIndex].value
    });
  }
  render() {
    return this.state.isOpen?(
      <div className="filter-container">
        <div className="filter-inner-box filter-show-box" onClick={this.close}>
          <p>Фильтры</p>
          <div><svg xmlns="http://www.w3.org/2000/svg" width="30" height="15" viewBox="0 0 34 16" fill="none">
            <path d="M32 14.5L17 2L2 14.5" stroke="black" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          </div>
        </div>
        <div className="filter-inner-box filter-content-box">
          <div className="flex-row">
            <div>Тип концерта:</div>
            <select onChange={this.changeConcertType} value={this.state.concertType}>
              <option value="">Нет</option>
              <option value="O">Опенэир</option>
              <option value="P">Вечеринка</option>
              <option value="C">Классическая музыка</option>
            </select>
          </div>
          {this.showStatusFilter ?
          <div className="flex-row">
            <div>Статус концерта:</div>
            <select onChange={this.changeConcertStatus} value={this.state.concertStatus}>
              <option value="">Нет</option>
              <option value="A">Активный</option>
              <option value="D">Удалён</option>
              <option value="P">Окончен</option>
            </select>
          </div>
          :null}
          <div className="text-row">
            Дата проведения:
          </div>
          <div className="flex-row">
            <div>С:</div>
            <input type="date" onChange={this.changeBeginDate} value={this.state.beginDate}/>
            <div>По:</div>
            <input type="date" onChange={this.changeEndDate} value={this.state.endDate}/>
          </div>
          <div className="text-row">
            Цена (BYN):
          </div>
          <div className="flex-row">
            <div>От:</div>
            <input type="number" onChange={this.changeStartPrice} value={this.state.startPrice} step="0.01" min="0" max={Number.isNaN(+this.state.endPrice)?100000:this.state.endPrice}/>
            <div>До:</div>
            <input type="number" onChange={this.changeEndPrice} value={this.state.endPrice} step="0.01" min={Number.isNaN(+this.state.startPrice)?0:this.state.startPrice} max="100000"/>
          </div>
        </div>
      </div>
    ):(
      <div className="filter-container" onClick={this.open}>
        <div className="filter-inner-box filter-show-box button-height" onClick={this.close}>
          <p>Фильтры</p>
          <div><svg xmlns="http://www.w3.org/2000/svg" width="30" height="15" viewBox="0 0 34 16" fill="none">
            <path d="M2 2L17 14.5L32 2" stroke="black" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          </div>
        </div>
      </div>
    );
  }
}