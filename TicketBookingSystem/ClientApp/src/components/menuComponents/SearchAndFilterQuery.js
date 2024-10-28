import React, { Component } from 'react';
import {SearchBar} from "./queryFilterComponents/SearchBar.js";
import {FilterMenu} from "./queryFilterComponents/FilterMenu.js";
import EventDispatcher from "../services/EventDispatcher.js";
import SessionManager from "../services/SessionManager";
import "./SearchAndFilterStyles.css";

export class SearchAndFilterQuery extends Component {
    static displayName = SearchAndFilterQuery.name;
    constructor(props) {
        super(props);
        this.searchData = {
            query: null,
            filter: null,
        };
        this.filterChanged = this.filterChanged.bind(this);
        this.search = this.search.bind(this);
    }
    filterChanged(filter) {
        this.searchData = {
            query: this.searchData.query,
            beginDate: filter.beginDate,
            endDate: filter.endDate,
            beginPrice: filter.startPrice,
            endPrice: filter.endPrice,
            concertType: filter.concertType,
            concertStatus: filter.concertStatus,
        };
        EventDispatcher.dispatch("onUserSetSearchFilters", this.searchData);
    }
    search(query) {
        this.searchData = {
            query: query,
            beginDate: this.searchData.beginDate,
            endDate: this.searchData.endDate,
            beginPrice: this.searchData.beginPrice,
            endPrice: this.searchData.endPrice,
            concertType: this.searchData.concertType,
            concertStatus: this.searchData.concertStatus,
        };
        EventDispatcher.dispatch("onUserSetSearchFilters", this.searchData);
    }
    render() {
        if (SessionManager.checkPermission(SessionManager.permissions.can_use_manager_panel)) return null;
        return (
            <div className="search-bar-with-filter">
                <FilterMenu onUpdateFilter={ this.filterChanged } />
                <SearchBar onSearch={ this.search } />
            </div>
        );
    }
}
