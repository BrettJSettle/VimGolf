import React from 'react'
import RecordPanel from './RecordPanel.js'
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import 'codemirror/keymap/vim.js'
import './css/Editor.css'
import {themeItems, modeItems} from './constants.js';
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
			fontSize: 12,
			mode: props.mode || 'javascript',
			theme: props.theme || 'monokai',
			vimState: '',
			value: props.value || '',
			...props
		}
		this.recordPanel = null
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

	handleMode = (mode) => {
		this.setState({mode: mode.value})
		this.editor.setOption('mode', mode.value)
	}

	handleTheme = (theme) => {
		this.setState({theme: theme.value})
		this.editor.setOption('theme', theme.value)
	}

	getState = () => {
		return {
				text: this.editor.getValue(),
				selections: serialize(this.editor.listSelections())
			}
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
		mirror.on('keydown', (a, b) => this.onKeyPress(a, b));
		
		mirror.on('vim-mode-change', function(e) {
			panel.setState({vimState: getModeStr(e.mode, e.subMode)})
		});
		
		this.editor.on('cursorActivity', () => this.onChange())
		this.editor.on('change', () => this.onChange())
		this.recordPanel.editor = this.editor
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
		if (this.recordPanel.state.recording !== null){
			this.recordPanel.keyPressed(key)
		}
		if (this.state.onKeyPress)
			this.state.onKeyPress(key)
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

	loadState(state){
		this.editor.setValue(state.text)
		if (state.cursor){
			// figure out how to apply vim mode
			this.editor.setSelections(state.selections)
		}
	}


	render(){
		const fontSizes = [8, 10, 12, 14, 16, 18, 24, 32, 48, 64].map(function(a){ return {value: a, label: a.toString()} })
		const comp = this;
		return (
			<div className="Editor">
					<div className="control-container">
						<RecordPanel
							ref={(a) => { comp.recordPanel = a} } />
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
