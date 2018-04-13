import React, { Fragment } from 'react';
import { Form } from 'semantic-ui-react';

export default class PasswordField extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
        password1: props.password || '',
        password2: '',
        showPassword: false
      };
  
      this.handlePassword1Changed = this.handlePassword1Changed.bind(this);
      this.handlePassword2Changed = this.handlePassword2Changed.bind(this);
      this.handleShowPasswordChange = this.handleShowPasswordChange.bind(this);
    }
  
    isPasswordValid() {
      return this.password1.trim() !== '' && this.password1 === this.password2;
    }
  
    updatePasswordUpdated(password1, password2) {
      if (!this.props.onChange) {
        return;
      }
  
      if (password1.trim() !== '' && password1 !== null && password1 === password2) {
        this.props.onChange(password1);
      }
      else {
        this.props.onChange(null);
      }
    }
  
    handlePassword1Changed(event, { value }) {
      this.setState({
        password1: value
      });
  
      this.updatePasswordUpdated(value, this.state.password2);
    }
  
    handlePassword2Changed(event, { value }) {
      this.setState({
        password2: value
      });
  
      this.updatePasswordUpdated(this.state.password1, value);
    }
  
    handleShowPasswordChange(event, { checked }) {
      this.setState({
        showPassword: checked
      });
    }
  
    render() {
      const inputType = (this.state.showPassword ? 'text' : 'password');
  
      return (
        <Fragment>
          <Form.Input label={this.props.label} type={inputType} placeholder='Password' value={this.state.password1} onChange={this.handlePassword1Changed} />
          <Form.Input label='Retype Password' type={inputType} placeholder='Retype Password' value={this.state.password2} onChange={this.handlePassword2Changed} />
          <Form.Checkbox label='Show Password' checked={this.state.showPassword} onChange={this.handleShowPasswordChange} />
        </Fragment>
      );
    }
  }