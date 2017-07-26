var React = require('react');
import {DefaultDraftBlockRenderMap, Editor, EditorState, RichUtils} from 'draft-js';
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
require('./css/main.css')
import { Map } from 'immutable';

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

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      currentFontSize: 12,
      inlineStyles: {}
    };
    console.log(this.props.match.params.docId)
    this.onChange = (editorState) => this.setState({editorState});
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
      console.log(obj.body, "body")
      // const rawCS =  JSON.parse(data.doc.text);
      // const contentState = convertFromRaw(rawCS);
      // const newState = EditorState.createWithContent(contentState);
      this.setState({
        editorState: obj.body
      })
      console.log(this.state.editorState)
    }).catch((err) => {
      console.log(err)
    })
  }

  //Saves Document to Database
  saveDocument() {
    // const rawCS= convertToRaw(this.state.editorState.getCurrentContent());
    // const strCS = JSON.stringify(rawCS);
    console.log("STATE TO SAVE", this.state.editorState)
    fetch('http://localhost:3000/saveDocument/'+this.props.match.params.docId, {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        updatedDocument: JSON.stringify(this.state.editorState)
      }
    }).then((response) => {
      return response.json()
    }).then((response) => {
      console.log(response)
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

  applyChangeFontSize(shrink) {
    var newFontSize = this.state.currentFontSize + (shrink? -4 : 4)
    var newInlineStyles= Object.assign(
      {},
      this.state.inlineStyles,
      {[newFontSize]: {
        fontSize: `${newFontSize}px`
      }

      })
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

  render() {
    return (
      <div className='container'>
      <MuiThemeProvider>
      <AppBar title="Document Name" iconElementRight={<FlatButton onClick={() => this.saveDocument()} label="Save" />}/>
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
      </div>

      <div className='editorcontainer'>
      <div className='editor'>
      <Editor customStyleMap={this.state.inlineStyles} editorState={this.state.editorState} onChange={this.onChange}
        blockRenderMap={myBlockTypes}/>
      </div>
      </div>
      </div>
    )
  }
}

export default MyEditor;
