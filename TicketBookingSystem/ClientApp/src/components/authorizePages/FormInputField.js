import React, { Component } from 'react';
import "./AuthStyles.css";

export class FormInputField extends Component{
  static displayName = FormInputField.name;

  constructor(props) {
    super(props);
	this.inputValueChanged = this.inputValueChanged.bind(this);
  }
  inputValueChanged(e){
  	if(this.props.onChange){
  		this.props.onChange(e.target.value);
  	}
  }
  render() {
    return (
      <div className="input-field">
      	<p>{this.props.text}</p>
          <div>
            <input type={this.props.isPassword ? "password" : this.props.isNumber ? "number" : "text"} min={this.props.min} onInput={this.inputValueChanged} value={this.props.value}/>
      	    {this.props.required?<sup>*</sup>:<sup></sup>}
          </div>
      </div>
    );
  }
}