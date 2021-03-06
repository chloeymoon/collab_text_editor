var React = require('react');
var ReactDOM = require('react-dom');

import App from './Components/App.js'
import MyEditor from './editor.js';
require('./css/main.css')

/* This can check if your electron app can communicate with your backend */
// fetch('http://localhost:3000')
// .then(resp => resp.text())
// .then(text => console.log(text))
// .catch(err => {throw err})

ReactDOM.render(<App />,
   document.getElementById('root'));
