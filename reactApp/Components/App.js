var React = require('react');
var ReactDOM = require('react-dom');
// var Register = require('./Components/register')
import Login from './login'
import Register from './register'
import { HashRouter, Route } from 'react-router-dom'
import DocumentPortal from './documentPortal'
import MyEditor from '../editor'

class App extends React.Component {
  render(){
    return (
      <HashRouter>
        <div>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path='/documentPortal' component={DocumentPortal} />
        <Route path='/editor' component={MyEditor} />
        <Route exact path="/" component={Login} />
      </div>
      </HashRouter>
    )
  }
}

export default App
