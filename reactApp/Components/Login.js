import React from 'react'
import { Link, Redirect } from 'react-router-dom'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const styles = {
  errorStyle: {
    color: 'orange',
  },
  underlineStyle: {
    borderColor: 'orange',
  },
  floatingLabelStyle: {
    color: 'orange',
  },
  floatingLabelFocusStyle: {
    color: 'blue',
  },
};

class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {username: '', password: ''}
  }

  handleUsernameChange(e) {
    this.setState({username: e.target.value})
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value})
  }

  handleSubmit() {
    fetch('http://localhost:3000/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    }).then((response) => {
      return (response.json())
    }).then((obj)=>{
      console.log(obj)
      if (obj.success) {
        this.setState({success: obj.success})
      }
    })
    this.setState({username: '', password: ''})
  }

  render () {
    return (
      <div>
        <MuiThemeProvider>
          <AppBar title="Document Name" iconElementRight={<FlatButton label="Save" />}/>
        </MuiThemeProvider>
        <h1>Login</h1>
        <MuiThemeProvider>
          <TextField
            type="text"
            onChange={(e) => this.handleUsernameChange(e)}
            value={this.state.username}
            floatingLabelText="username"
            floatingLabelStyle={styles.floatingLabelStyle}
            floatingLabelFocusStyle={styles.floatingLabelFocusStyle}
          />
        </MuiThemeProvider>
        <MuiThemeProvider>
          <TextField
            type="password"
            onChange={(e) => this.handlePasswordChange(e)}
            value={this.state.password}
            floatingLabelText="password"
            floatingLabelStyle={styles.floatingLabelStyle}
            floatingLabelFocusStyle={styles.floatingLabelFocusStyle}
          />
        </MuiThemeProvider>
        <div>
          <MuiThemeProvider>
            <FlatButton
              label="LOGIN"
              onClick={() => this.handleSubmit()}
            />
          </MuiThemeProvider>
        </div>

        <Link to="/register">Register</Link>
        {this.state.success ? <Redirect to="/documentPortal" /> : null}
      </div>
    )
  }
}

export default Login
