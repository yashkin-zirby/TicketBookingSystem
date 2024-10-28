import React, { Component } from 'react';
import { ReactComponent as SearchButtonIcon } from "../../assets/search-icon.svg";
import './SearchBarStyles.css';
export class SearchBar extends Component {
  static displayName = SearchBar.name;

  constructor(props) {
    super(props);

    this.state = {
      searchQuery: ""
    };
    this.searchClick = this.searchClick.bind(this);
    this.searchQueryChanged = this.searchQueryChanged.bind(this);
  }
  searchClick(){
      if (this.props.onSearch) {
          this.props.onSearch(this.state.searchQuery);
      }
  }
  searchQueryChanged(e){
    this.setState({
      searchQuery: e.target.value
    });
  }
  render() {
    return (
      <div className="search-bar">
        <input onChange={this.searchQueryChanged}/>
        <SearchButtonIcon onClick={this.searchClick}/>
      </div>
    );
  }
}
