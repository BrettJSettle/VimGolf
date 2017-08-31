import React from 'react'
import Select from 'react-select';
import FA from 'react-fontawesome'
import 'react-select/dist/react-select.css';
import 'codemirror/keymap/vim.js'
import './css/Editor.css'
import {themeItems, modeItems} from './constants.js';
import {db, auth, provider} from './firebase.js'
import {abbrevs} from './constants.js'

var CodeMirror = require('codemirror')

function ignoreEvent(m, e) {
	e.preventDefault()
}

export function getModeStr(mode, subMode){
	let modeStr = ''
	switch (mode){
		case 'insert':
	 		modeStr = '-- INSERT --'
	 		break
		case 'visual':
			const sub = subMode === 'linewise' ? 'LINE ' : (subMode === 'blockwise' ? 'BLOCK ' : '')
			modeStr = '-- VISUAL ' + sub + '--'
	 		break
		case 'replace':
			modeStr = '-- REPLACE --'
			break
		case 'normal':
			break
		default:
			modeStr = 'MODE: ' + mode
			break
	 }
	 return modeStr
}

class Recording {
	constructor(doc, cursor, selections){
		this.start = doc
		this.startCursor = cursor
		this.startSelections = selections
		this.goal = null
		this.goalCursor = null
		this.goalSelections = null
		this.solution = []
	}

	update = (key) => {
		this.solution.push(key)
	}

	finished = (doc, cursor, selections) => {
		this.goal = doc
		this.goalCursor = cursor
		this.goalSelections = selections
	}

	asObject = () => {
		var obj = {}
		obj['start'] = {
			doc: this.start,
			cursor: this.startCursor,
			selections: this.startSelections}
		obj['goal'] = {
			doc: this.goal,
			cursor: this.goalCursor,
			selections: this.goalSelections
		}
		obj.solution = this.solution
		return obj
	}
}

export default class Editor extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			fontSize: 12,
			mode: props.mode || 'javascript',
			theme: props.theme || 'monokai',
			recording: null,
			user: null,
			vimState: '',
			value: props.value || '',
			...props
		}
		this.toolbar = props.toolbar || <div />
		this.editor = null
	}

	clearMode() {
		if (this.editor.state.vim.visualMode) {
  		CodeMirror.Vim.exitVisualMode(this.editor)
		} else if (this.editor.state.vim.insertMode) {
			CodeMirror.Vim.exitInsertMode(this.editor)
		}
	}

	handleMode = (mode) => {
		this.setState({mode: mode.value})
		this.editor.setOption('mode', mode.value)
	}

	handleTheme = (theme) => {
		this.setState({theme: theme.value})
		this.editor.setOption('theme', theme.value)
	}

	componentWillMount() {
	 	const comp = this
	 	auth().onAuthStateChanged(function(u){
			comp.setState({user: u})
		});
	}

	componentDidMount() {
		const options = {
			lineNumbers: true,
			dragDrop: false,
			smartIndent: false,
			fontSize: 20,
			mode: this.state.mode,
			theme: this.state.theme,
			keyMap: 'vim',
			matchBrackets: true,
			styleSelectedText: true,
		}
		
		const panel = this
		const el = document.getElementById(this.state.id)
		if (el === undefined)
			return

		this.editor = CodeMirror.fromTextArea(el, options)
		
		this.editor.setSize(null, '500px')

		window.editor = this.editor
		const mirror = this.editor

		mirror.on('paste', ignoreEvent)
  	mirror.on('cut', ignoreEvent)
		mirror.on('contextmenu', ignoreEvent)
		mirror.on('copy', ignoreEvent)
		mirror.on('touchstart', ignoreEvent)

		mirror.on('mousedown', (m, e) => {
			mirror.focus()
			ignoreEvent(m, e)
		})
		if (this.state.onKeyPress){
			mirror.on('keydown', (a, b) => this.onKeyPress(a, b));
		}
		
		mirror.on('vim-mode-change', function(e) {
			panel.setState({vimState: getModeStr(e.mode, e.subMode)})
		});
		
		this.editor.on('cursorActivity', () => this.onChange())
		this.editor.on('change', () => this.onChange())
	}

	getCursorMode(){
		let mode = 'normal', sub = undefined
		if (this.editor.state.vim.insertMode)
			mode = this.editor.state.overwrite ? 'replace' : 'insert'
		else if (this.editor.state.vim.visualMode){
			mode = 'visual'
			sub = this.editor.state.vim.visualBlock ? 'blockwise' : this.editor.state.visualLine ? 'linewise' : undefined
		}
		return {mode: mode, subMode: sub}
	}

	onKeyPress = (a, keyEvent) => {
		var key = abbrevs[keyEvent.key] || keyEvent.key
		if (this.state.recording !== null){
			this.state.recording.update(key)
		}
		console.log(this.state.recording.solution)
	}

	onChange = () => {
		if (this.state.onChange)
			this.state.onChange()
	}

	handleFontSize = (a) => {
		this.setState({fontSize: a.value})
		document.getElementsByClassName('CodeMirror')[0].style['fontSize'] = a.value + "px"
		this.editor.refresh()
	}

	record = () => {
		var recording = new Recording(this.editor.getDoc().copy(), this.editor.getCursor(), this.editor.listSelections())
		window.rec = recording
		this.setState({recording: recording})
		this.editor.focus()
	}

	finishedRecording = () => {
		this.state.recording.finished(this.editor.getDoc().copy(), this.editor.getCursor(), this.editor.listSelections())
		this.editor.swapDoc(this.state.recording.start)
		this.editor.setCursor(this.state.recording.startCursor)
		this.editor.setSelections(this.state.recording.startSelections)
		
		this.saveRecording()
	}

	login = () => {
	  const result = auth().signInWithPopup(provider)
		this.setState({user: result.user});
	}

	logout = () => {
		auth().signOut()
		this.setState({user: null});
	}

	saveRecording = () => {
		var recording = this.state.recording.asObject()

		console.log(recording)

		db.ref('tasks').push(recording)

		this.setState({recording: null})
		this.editor.focus()
	}
	
	render(){
		const fontSizes = [8, 10, 12, 14, 16, 18, 24, 32, 48, 64].map(function(a){ return {value: a, label: a.toString()} })
		const comp = this;
		return (
			<div className="Editor">
					<div className="control-container">
    				<div className="div-left">
							{this.state.user === null ?
							<ul className="button-tab">
								<li>
									<button placeholder="Login to Facebook to save tasks" onClick={this.login} className="Login">Login</button>
								</li>
							</ul> :
							this.state.recording !== null ?
      				<ul className="button-tab">
								<li>
									<button placeholder="Save as new task" className="StopRecord"onClick={comp.finishedRecording}><FA name="check"/></button>
								</li>
								<li>
									<button placeholder="Cancel task" className="CancelRecord" onClick={() => comp.setState({recording: null})}><FA name="times"/></button>
								</li>
							</ul>
							:
							<ul className="button-tab">
								<li>
									<button placeholder="Record a new task" className="Record" onClick={comp.record}><FA name="circle"/></button>
								</li>	
								<li> { this.state.user !== undefined ? <p>Hi {this.state.user.displayName.split(' ')[0]} </p> : <p />}
									<button className="Logout" onClick={this.logout} >Logout</button>
								</li>
							</ul>
							}
    				</div>
						{/* this.toolbar */}
    				<div className="div-right">
      				<ul className="button-tab">
        				<li>
									<Select className="EditorFontSelect"
										value={this.state.fontSize}
										options={fontSizes}
										clearable={false}
										autosize={false}
										style={{width: '60px', outline: 'none'}}
										onChange={this.handleFontSize}
									/>
        				</li>
        				<li>
									<Select className="EditorThemeSelect"
										value={this.state.theme}
										options={themeItems}
										clearable={false}
										autosize={false}
										style={{width: '150px'}}
										onChange={this.handleTheme}
									/>
        				</li>
        				<li>
									<Select className="EditorModeSelect"
										value={this.state.mode}
										options={modeItems}
										clearable={false}
										autosize={false}
										style={{width: '150px'}}
										onChange={this.handleMode}
									/>
        				</li>
      				</ul>
    				</div>
				</div>
				<textarea id={this.state.id} />
		  	<p className='VimState' >{this.state.vimState}</p>
			</div>
		)
	}

}
