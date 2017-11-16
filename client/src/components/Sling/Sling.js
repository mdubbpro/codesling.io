import React, { Component } from 'react';
import CodeMirror from 'react-codemirror2';
import io from 'socket.io-client/dist/socket.io.js';
import { throttle } from 'lodash';

import Button from '../globals/Button';
import StdOut from './StdOut';
import EditorHeader from './EditorHeader';

import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import './Sling.css';

class Sling extends Component {
  state = {
    text: '',
    stdout: '',
    highlight: [],
  }

  highlights = {}
  // <=== The below function is responsible for rendering highlights

  userHL = () => {

    let cordarray = this.state.highlight;

    console.log('userHL = cord array is,', cordarray)
    // console.log('first cord is, ', cordarray[0])

    var marker = this.editor.markText({
      line: cordarray[0],
      ch: cordarray[1]
    }, {
      line: cordarray[2],
      ch: cordarray[3]
    }, {
      css: "background-color: #FFFF00"
    });

    function timeclear(){
      marker.clear();
    }
    setTimeout(timeclear, 2000);

  }

  // <=== This function is responsible for getting your cordinates as you move

  getHL = () => {
    var cords = [];
    var data = this.editor.doc.listSelections()
    // console.log('starts on line,', data[0].head.line)
    // console.log('starts on ch,', data[0].head.ch)
    // console.log('ends on line,', data[0].anchor.line)
    // console.log('ends on ch,', data[0].anchor.ch)
    cords.push(data[0].head.line);
    cords.push(data[0].head.ch);
    cords.push(data[0].anchor.line);
    cords.push(data[0].anchor.ch);
    console.log(cords)
  
    // <=== this is where you can update the cords 
    
    // this.setState({ highlight: cords })
    // console.log(this.state.highlight)

    this.setState({ highlight: cords })
    console.log('current highlight state is, ', this.state.highlight)


    this.socket.emit('client.highlight', {
      highlight: cords
    })
  }

  runCode = () => {
    this.socket.emit('client.run');
  }
  
  componentDidMount() {

    this.editor.on('cursorActivity', this.getHL);

    this.socket = io(process.env.REACT_APP_SOCKET_SERVER_URL, {
      query: {
        roomId: this.props.slingId,
      }
    });

    this.socket.on('connect', () => {
      this.socket.emit('client.ready');
    });

    this.socket.on('server.initialState', ({ id, text }) => {
      this.setState({ id, text });
    });

    this.socket.on('server.changed', ({ text }) => {
      this.setState({ text });
    });

    this.socket.on('server.highlight', ({ highlight }) => {
      this.setState({ highlight });
  
      console.log('after server highlight', this.state)
    });

    this.socket.on('server.run', ({ stdout }) => {
      this.setState({ stdout });
    });
    
    window.addEventListener('resize', this.setEditorSize);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.setEditorSize);
  }

  handleChange = throttle((editor, metadata, value) => {
    this.socket.emit('client.update', { text: value });
  }, 250)

  setEditorSize = throttle(() => {
    this.editor.setSize(null, `${window.innerHeight - 80}px`);
  }, 100);

  initializeEditor = (editor) => {
    // give the component a reference to the CodeMirror instance
    this.editor = editor;
    console.log(editor);
    this.setEditorSize();
  }

  render() {
    return (
      <div className="sling-container">
        <EditorHeader />
        <div className="code-editor-container">
          <CodeMirror
            editorDidMount={this.initializeEditor}
            value={this.state.text}
            options={{
              mode: 'javascript',
              lineNumbers: true,
              theme: 'base16-dark',
            }}
            onChange={this.handleChange}
          />
        </div>
        <div className="stdout-container">
          <Button
            className="run-btn"
            text="Run Code"
            backgroundColor="red"
            color="white"
            onClick={this.runCode}
          />
          <Button
            className="run-btn"
            text="Dummy test"
            backgroundColor="red"
            color="white"
            onClick={this.userHL}
          />
          <Button
            className="run-btn"
            text="Get Cordinates"
            backgroundColor="red"
            color="white"
            onClick={this.getHL}
          />
          <StdOut 
            text={this.state.stdout}
          />
        </div>
      </div>
    );
  }
}

export default Sling;



// This function is just a placeholder for highlighting format

    // dummyHL = () => {
    //   // console.log(this);
    //   // console.log(this.editor);
    //   console.log(this.editor.doc.getCursor())
    //   console.log(this.editor.doc.listSelections())
    //   this.editor.markText({
    //     line: 0,
    //     ch: 1
    //   }, {
    //     line: 0,
    //     ch: 7
    //   }, {
    //     css: "background-color: #FFFF00"
    //   });
    //   // this.editor.doc.getHistory();
    // }

// This function is just a placeholder for document get format

    // this.editor.on('cursorActivity', function () {
    //     console.log('you selected something')
    //     // console.log(this.editor)
    //     // Fetch the current CodeMirror document.
    //     // var doc = editor.getDoc();
    // });