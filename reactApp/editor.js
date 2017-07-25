var React = require('react');
import {DefaultDraftBlockRenderMap, Editor, EditorState, RichUtils} from 'draft-js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import injectTapEventPlugin from 'react-tap-event-plugin';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
require('./css/main.css')


class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty() };
    this.onChange = (editorState) => this.setState({editorState});
  }

  toggleInlineFormat(e, style) {
    e.preventDefault();
    this.setState({
      editorState: RichUtils.toggleInlineStyle(this.state.editorState, style)
    });
  }

  formatButton({icon, style}) {
    return (
      <MuiThemeProvider>
        <FlatButton icon={<FontIcon className="material-icons">{icon}</FontIcon>}
          onMouseDown={(e)=>this.toggleInlineFormat(e, style)}/>
        </MuiThemeProvider>
    )
  }

  render() {
    return (
      <div className='container'>
      <MuiThemeProvider>
      <AppBar title="Document Name" iconElementRight={<FlatButton label="Save" />}/>
      </MuiThemeProvider>
      <div className="toolbar">
        {this.formatButton({icon: 'format_bold', style: 'BOLD'})}
        {this.formatButton({icon: 'format_italic', style: 'ITALIC'})}
        {this.formatButton({icon: 'format_underlined', style: 'UNDERLINE'})}
        {this.formatButton({icon: 'format_align_left', style: 'BOLD'})}
        {this.formatButton({icon: 'format_align_center', style: 'BOLD'})}
        {this.formatButton({icon: 'format_align_right', style: 'BOLD'})}
        {this.formatButton({icon: 'format_color_text', style: 'BOLD'})}
        {this.formatButton({icon: 'format_size', style: 'BOLD'})}
        {this.formatButton({icon: 'format_list_bulleted', style: 'BOLD'})}
        {this.formatButton({icon: 'format_list_numbered', style: 'BOLD'})}
      </div>
      <div className='editorcontainer'>
      <div className='editor'>
      <Editor ref="editor" editorState={this.state.editorState} onChange={this.onChange}/>
      </div>
      </div>
      </div>
    )
  }
}

export default MyEditor;
