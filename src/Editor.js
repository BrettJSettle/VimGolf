import React from 'react'
import 'react-select/dist/react-select.css';
import 'codemirror/keymap/vim.js'
import './css/Editor.css'
import {abbrevs, serialize} from './constants.js'

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


export default class Editor extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			fontSize: props.fontSize || 12,
			mode: props.mode || 'javascript',
			theme: props.theme || 'monokai',
			vimState: '',
			value: props.value || '',
			...props
		}
		this.editor = null
		window.editor = this
	}

	clearMode() {
		if (this.editor.state.vim.visualMode) {
  		CodeMirror.Vim.exitVisualMode(this.editor)
		} else if (this.editor.state.vim.insertMode) {
			CodeMirror.Vim.exitInsertMode(this.editor)
		}
	}

	getState = () => {
		return {
				text: this.editor.getValue(),
				selections: serialize(this.editor.listSelections())
			}
	}

	componentDidMount() {
		let options = {
			lineNumbers: true,
			dragDrop: false,
			smartIndent: false,
			fontSize: 12,
			mode: this.state.mode,
			theme: this.state.theme,
			keyMap: 'vim',
			matchBrackets: true,
			styleSelectedText: true,
		}
		if (this.props.hasOwnProperty('editorOptions'))
			options = Object.assign(options, this.props.editorOptions)

		const panel = this
		const el = document.getElementById(this.state.id)
		if (el === undefined)
			return

		this.editor = CodeMirror.fromTextArea(el, options)
		const height = '100%';
		this.editor.setSize(null, height)

		window.editor = this
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
		mirror.on('keyup', (a, b) => this.onKeyPress(a, b));
		
		mirror.on('vim-mode-change', function(e) {
			panel.setState({vimState: getModeStr(e.mode, e.subMode)})
		});
		
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
		/*if (this.recordPanel.state.recording !== null){
			this.recordPanel.keyPressed(key)
		}*/
		if (this.state.onKeyPress)
			this.state.onKeyPress(key)
	}

	componentWillUpdate(n){
		//console.log(n)
	}

	handleFontSize = (a) => {
		this.setState({fontSize: a})
		document.getElementsByClassName('CodeMirror')[0].style['fontSize'] = a + "px"
		this.editor.refresh()
	}

	loadState(state){
		this.editor.setValue(state.text)
		if (state.cursor){
			// figure out how to apply vim mode
			this.editor.setSelections(state.selections)
		}
	}


	render(){
		return (
			<div className="Editor">
				<div className="Editor-container">
					<div className="Editor-content">
						<textarea id={this.state.id} />
					</div>
				</div>
		  	<p className='VimState' >{this.state.vimState}</p>
			</div>
		)
	}

}
