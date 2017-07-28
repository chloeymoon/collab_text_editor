var React = require('react');
import {DefaultDraftBlockRenderMap, Editor, EditorState, RichUtils, convertToRaw, convertFromRaw} from 'draft-js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import injectTapEventPlugin from 'react-tap-event-plugin';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import * as colors from 'material-ui/styles/colors'
import { BlockPicker } from 'react-color';
import Popover from 'material-ui/Popover';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
require('./css/main.css')
import { Map } from 'immutable';

import { Link, Redirect } from 'react-router-dom'


const myBlockTypes = DefaultDraftBlockRenderMap.merge(new Map({
  left: {
    wrapper:<div className="left-align"/>
  },
  center: {
    wrapper:<div className="center-align"/>
  },
  right: {
    wrapper:<div className="right-align"/>
  }
}))


//M3
import io from 'socket.io-client'

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      currentFontSize: 12,
      inlineStyles: {},
      status: false,
      backStatus: false,
      docTitle: "",
      user: "",
      currentUsers: [],
      history: []
    };

    this.previousHighlight = null;
    //M3 - listens on the client side - can also go into componenet did mount
    this.socket = io('http://localhost:3000');
    this.socket.emit('hello');


    //listener for user join event
    this.socket.on('userJoined', ({user}) => {
      console.log(user, 'joined');
      const newUsers = this.state.currentUsers
      newUsers.push(user)
      this.setState({currentUsers: newUsers})
    });


    //event handler for updating editor content when other user edits
    this.socket.on('receiveNewContent', stringifiedContent => {
      const contentState = convertFromRaw(JSON.parse(stringifiedContent));
      const newEditorState = EditorState.createWithContent(contentState);
      this.setState({ editorState: newEditorState});
    });


    //event handler for cursor
    this.socket.on('receiveNewCursor', incomingSelectionObj => {
    let editorState = this.state.editorState
    const ogEditorState = editorState //saving original editorstate
    const ogSelection = editorState.getSelection() //saving original selection

    const incomingSelectionState = ogSelection.merge(incomingSelectionObj) //taking original selection state and changing values to incoming one

    //change editor state to have the new selection state
    const temporaryEditorState = EditorState.forceSelection(ogEditorState, incomingSelectionState)

    //if you set this editor state to the current editor state, the windows cursor will move
    //second argument is a function that runs once setState has completed!
    this.setState({editorState: temporaryEditorState}, () => {

      //getting window selection, different from the draft selection
      const winSel = window.getSelection();
      const range = winSel.getRangeAt(0)
      //gives you screen coordinates that you can use to draw a box
      const rects = range.getClientRects()[0];
      const {top, left, bottom } = rects //shorthand for const top= rects.top

      //save the coordinates and restore original editorState
      this.setState({ editorState: ogEditorState, top, left, height: bottom-top})
    })
  })



    this.socket.on('userLeft', () => {
      console.log("user left");
    });

    this.onChange = (editorState) => {
      //save current selection
      const selection = editorState.getSelection()

      //need a new editor state with old selection to toggle that style
      if (this.previousHighlight) {

        //new editor state with old highlight selected
        editorState = EditorState.acceptSelection(editorState, this.previousHighlight)

        //toggle off the old highlight
        editorState = RichUtils.toggleInlineStyle(editorState, 'RED')

        //come back to most recent selection
        editorState = EditorState.acceptSelection(editorState, selection)
        this.previousHighlight = null;
      }


      if (selection.getStartOffset() === selection.getEndOffset()) {
        this.socket.emit('cursorMove', selection);
      } else {
        editorState = RichUtils.toggleInlineStyle(editorState, 'RED')
        this.previousHighlight = editorState.getSelection()
      }

      const contentState = editorState.getCurrentContent(); //want to send this to the other client
      //contentState as is is unshippable
      //there is a function that comes with content state called convertToRaw
      const stringifiedContent = JSON.stringify(convertToRaw(contentState));
      this.socket.emit('newContent', stringifiedContent);
      this.setState({editorState, status: false});
    };
  }

  //Renders the Page with Information
  componentDidMount () {
    fetch('http://localhost:3000/editDocument/'+this.props.match.params.docId, {
      method: 'GET',
      credentials: 'include',
      success: function(data) {
      }
    }).then((response) => {
      return (response.json())
    }).then((obj)=>{
      const rawCS =  JSON.parse(obj.doc.body);
      const contentState = convertFromRaw(rawCS);
      const newState = EditorState.createWithContent(contentState);
      //console.log(this.state.editorState)
      this.setState({
        editorState: newState,
        currentFontSize: obj.doc.font,
        inlineStyles: obj.doc.inlineStyles,
        history: obj.doc.history,
        docTitle: obj.doc.title,
        user: obj.user
      })
      console.log("HISTORY", this.state.history)

      //emits the document ID when joined
      this.socket.emit('join', {doc: this.props.match.params.docId, user: this.state.user});
      return
      //console.log("HERE", this.state.currentFontSize)
    }).catch((err) => {
      console.log(err)
    })

  }

//M3to disconnecte
  componentWillUnmount(){
    this.socket.disconnect();
  }

  //Saves Document to Database
  saveDocument() {
    //sets document save status to true
    this.setState({status: true})

    const rawCS= convertToRaw(this.state.editorState.getCurrentContent());
    const strCS = JSON.stringify(rawCS);
    //console.log(this.state.editorState)
    fetch('http://localhost:3000/saveDocument/'+this.props.match.params.docId, {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        updatedDocument: strCS,
        currentFontSize: this.state.currentFontSize,
        inlineStyles: this.state.inlineStyles
      })
    }).then((response) => {
      return response.json()
    }).then((response) => {
      this.setState({history: response.updatedHistory})
    })
  }



  toggleFormat(e, style, block) {
    e.preventDefault();
    if (block) {
      this.setState({
      editorState: RichUtils.toggleBlockType(this.state.editorState, style)
    });
    } else {
      this.setState({
      editorState: RichUtils.toggleInlineStyle(this.state.editorState, style)
    });
  }
  }

  formatButton({icon, style, block}) {
    return (
      <MuiThemeProvider>
        <FlatButton
          backgroundColor={this.state.editorState.getCurrentInlineStyle().has(style)? colors.lightBlue50:colors.grey50}
          icon={<FontIcon className="material-icons">{icon}</FontIcon>}
          onMouseDown={(e)=>this.toggleFormat(e, style, block)}/>
        </MuiThemeProvider>
    )
  }

  formatColor (color) {
    //create style for the color
    //use RichUtils to apply new style
    var newInlineStyles= Object.assign(
      {},
      this.state.inlineStyles,
      {[color.hex]: {
        color: color.hex
      }

      })
    this.setState({
      inlineStyles: newInlineStyles,
      editorState: RichUtils.toggleInlineStyle(this.state.editorState, color.hex)
    })
  }

  openColorPicker(e) {
    this.setState({
      colorPickerOpen: true,
      colorPickerButton: e.target
    });
  }

  closeColorPicker() {
    this.setState({
      colorPickerOpen: false,
    });
  }

  colorPicker() {
    return(
    <div style={{display:'inline-block'}}>
    <MuiThemeProvider>
      <FlatButton
        backgroundColor={colors.grey50}
        icon={<FontIcon className="material-icons">format_color_text</FontIcon>}
        onClick={this.openColorPicker.bind(this)}/>
      </MuiThemeProvider>
      <MuiThemeProvider>
      <Popover
          open={this.state.colorPickerOpen}
          anchorEl={this.state.colorPickerButton}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.closeColorPicker.bind(this)}
        >
        <BlockPicker onChangeComplete={this.formatColor.bind(this)}/>
        </Popover>
        </MuiThemeProvider>
        </div>
    )
  }

  openHistoryPicker(e) {
    this.setState({
      historyPickerOpen: true,
      historyPickerButton: e.target
    });
  }

  closeHistoryPicker() {
    this.setState({
      historyPickerOpen: false,
    });
  }

  historyOnClick(obj) {
    console.log(obj)
    const rawCS =  JSON.parse(obj.body);
    const contentState = convertFromRaw(rawCS);
    const newState = EditorState.createWithContent(contentState);
    this.setState({
      editorState: newState,
      currentFontSize: obj.currentFontSize,
      inlineStyles: obj.inlineStyles
    })
  }

  menuItems() {
    const historyArr = this.state.history;
    if (historyArr) {
      const recentHistory = historyArr.slice(historyArr.length-4, historyArr.length+1).reverse()
    return recentHistory.map((obj)=> {
      return (
        <MenuItem primaryText={obj.date} onClick={()=>this.historyOnClick(obj)}/>
      )
    })
  }
  }

historyPicker() {
  return (
    <div style={{display:'inline-block'}}>
    <MuiThemeProvider>
      <FlatButton
        backgroundColor={colors.grey50}
        icon={<FontIcon className="material-icons">history</FontIcon>}
        onClick={this.openHistoryPicker.bind(this)}/>
      </MuiThemeProvider>
      <MuiThemeProvider>
      <Popover
          open={this.state.historyPickerOpen}
          anchorEl={this.state.historyPickerButton}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.closeHistoryPicker.bind(this)}
        >
        <Paper>
          <Menu>
          {this.menuItems()}
          </Menu>
          </Paper>
        </Popover>
        </MuiThemeProvider>
        </div>
  )
}




  applyChangeFontSize(shrink) {
    var newFontSize = this.state.currentFontSize + (shrink? -4 : 4)
    var thingToRemove = String(this.state.currentFontSize)
    //console.log(thingToRemove, "TO REMOVE")
    var currentState = Object.assign({}, this.state.inlineStyles)
    //console.log(currentState, "CURRENT STATE")
    delete currentState[this.state.currentFontSize]
    //console.log(currentState, "CURRENT STATE2")
    var newInlineStyles= Object.assign(
      {},
      currentState,
      {[newFontSize]: {
        fontSize: `${newFontSize}px`
      }

      })
      //console.log('NEW INLINE', newInlineStyles)
    this.setState({
      inlineStyles: newInlineStyles,
      editorState: RichUtils.toggleInlineStyle(this.state.editorState, String(newFontSize)),
      currentFontSize: newFontSize
    })
  }

  changeFontSize(shrink) {
        return(
      <MuiThemeProvider>
        <FlatButton
          backgroundColor={colors.grey50}
          icon={<FontIcon className="material-icons">{shrink? 'zoom_out': 'zoom_in'}</FontIcon>}
          onMouseDown={()=> this.applyChangeFontSize(shrink)}/>
      </MuiThemeProvider>
    )
  }

  checkStatus(){
    console.log('checking Status!')
    this.state.status ?
      (this.setState({backStatus: true})):
      (alert("Please make sure to save, or else your changes may be lost!"));
  }

  render() {
    return (
      <div className='container'>

      {this.state.top && (
        <div
        style = {{position: 'absolute',
          backgroundColor: 'red',
          width: '5px',
          height: this.state.height,
          top: this.state.top, left: this.state.left}}>
        </div>
      )}
      <MuiThemeProvider>
      <AppBar title={this.state.docTitle} iconElementRight={
        <div>
          <FlatButton onClick={() => this.saveDocument()} label="Save" />
          <FlatButton onClick={() => this.checkStatus()} label="Back" />
          {this.state.currentUsers.map((user) => (<div>{user}</div>))}
        </div>
      }/>
      </MuiThemeProvider>
      <div className="toolbar">
        {this.formatButton({icon: 'format_bold', style: 'BOLD'})}
        {this.formatButton({icon: 'format_italic', style: 'ITALIC'})}
        {this.formatButton({icon: 'format_underlined', style: 'UNDERLINE'})}
        {this.formatButton({icon: 'format_align_left', style: 'left', block:true})}
        {this.formatButton({icon: 'format_align_center', style: 'center', block:true})}
        {this.formatButton({icon: 'format_align_right', style: 'right', block:true})}
        {this.colorPicker()}
        {this.changeFontSize(false)}
        {this.changeFontSize(true)}
        {this.formatButton({icon: 'format_list_numbered', style: 'ordered-list-item', block: true})}
        {this.formatButton({icon: 'format_list_bulleted', style: 'unordered-list-item', block:true})}
        {this.historyPicker()}
      </div>

      <div className='editorcontainer'>
      <div className='editor'>
      <Editor customStyleMap={Object.assign({}, this.state.inlineStyles, {"RED": {backgroundColor:'red'}})} editorState={this.state.editorState} onChange={this.onChange}
        blockRenderMap={myBlockTypes}/>
      </div>
      </div>
      {this.state.backStatus ? <Redirect to="/documentPortal" /> : null}
      </div>
    )
  }
}

export default MyEditor;
