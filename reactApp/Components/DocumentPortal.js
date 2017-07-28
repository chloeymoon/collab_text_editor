import React from 'react'
import { Link } from 'react-router-dom'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';

class DocumentPortal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      createDocument: '',
      addShared: '',
      documents: [],
      sharedDocuments: []
    }
  }

  handleCreateChange(e) {
    this.setState({createDocument: e.target.value})
  }

  handleSharedChange(e) {
    this.setState({addShared: e.target.value})
  }

  postDocument() {
    fetch('http://localhost:3000/documents', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: this.state.createDocument
      })
    }).then((response) => {
      return (response.json())
    }).then((obj)=>{
      const documents = this.state.documents
      documents.push(obj)
      this.setState({createDocument: '', documents: documents})
    })
  }

  addSharedDocument() {
    fetch('http://localhost:3000/sharedDocuments', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sharedDocumentId: this.state.addShared
      })
    }).then((response) => {
      return (response.json())
    }).then((obj)=>{
      const documents = this.state.sharedDocuments
      documents.push(obj)
      this.setState({addShared: '', sharedDocuments: documents})
    })
  }

  handleLogout() {
    fetch('http://localhost:3000/logout', {
      method: 'GET',
      success: function(data) {
      }
    }).then((response) => {
      return (response.json())
    }).then((obj)=>{
      console.log("logout", obj)
    })
  }

  componentDidMount () {
    fetch('http://localhost:3000/documents', {
      method: 'GET',
      credentials: 'include',
      success: function(data) {
      }
    }).then((response) => {
      return (response.json())
    }).then((obj)=>{
      this.setState({documents: obj})
      console.log("get docs", obj)
    }).catch((err) => {
      console.log(err)
    })

    fetch('http://localhost:3000/sharedDocuments', {
      method: 'GET',
      credentials: 'include',
      success: function(data) {
      }
    }).then((response) => {
      return (response.json())
    }).then((obj)=>{
      this.setState({sharedDocuments: obj})
      console.log("get shared docs", obj)
    }).catch((err) => {
      console.log(err)
    })

  }


  render () {
    return (
      <div>
        <MuiThemeProvider>
        <AppBar
          title="Document Portal: Welcome"
          iconElementRight={
            <Link to="/login">
            <FlatButton onClick={() => this.handleLogout()} style={{color: 'white'}} label="LOGOUT" />
            </Link>
          }
          showMenuIconButton={false}
        />
      </MuiThemeProvider>

        <input
          type="text"
          placeholder="new document title"
          onChange={(e) => this.handleCreateChange(e)}
          value={this.state.createDocument}
        />
        <input
          type="submit"
          value="Create Document"
          onClick={() => this.postDocument()}
        />

        <div>
          <p>My Documents</p>
          {this.state.documents.map((doc) => <div><Link to={`/editor/${doc._id}`}>{doc.title}</Link></div>)}
        </div>

        <div>
          <p>Shared Documents</p>
          {this.state.sharedDocuments.map((doc) => <div><Link to={`/editor/${doc._id}`}>{doc.title}</Link></div>)}
        </div>

        <input
          type="text"
          placeholder="paste doc id here"
          onChange={(e) => this.handleSharedChange(e)}
          value={this.state.addShared}
        />
        <input
          type="submit"
          value="Add Shared Document"
          onClick={() => this.addSharedDocument()}
        />
        <div>
        </div>
        {/* {this.state.success ? <Redirect to="/login" /> : null} */}
      </div>
    )
  }
}

export default DocumentPortal
