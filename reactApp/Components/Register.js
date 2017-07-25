import React from 'react'
import { Link } from 'react-router-dom'

class Register extends React.Component {
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
    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
    this.setState({username: '', password: ''})
  }

  render () {
    return (
      <div>
        <h1>Register</h1>
        <input
          type="text"
          placeholder="username"
          onChange={(e) => this.handleUsernameChange(e)}
          value={this.state.username}
        />
        <input
          type="password"
          placeholder="password"
          onChange={(e) => this.handlePasswordChange(e)}
          value={this.state.password}
        />
        <button onClick={() => this.handleSubmit()}>Register</button>
        <Link to="/login">Login</Link>
      </div>
    )
  }
}

export default Register
