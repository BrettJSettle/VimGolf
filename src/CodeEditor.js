import React from 'react'
import 'codemirror/keymap/vim.js'
import './CodeEditor.css'

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

export default class CodeEditor extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			options: props.options || {},
			vimState: '',
			value: props.value || '',
			...props
		}

		this.editor = null
	}

	clearMode() {
		if (this.editor.state.vim.visualMode) {
  		CodeMirror.Vim.exitVisualMode(this.editor)
		} else if (this.editor.state.vim.insertMode) {
			CodeMirror.Vim.exitInsertMode(this.editor)
		}
	}

	setMode(mode){
		this.editor.setOption('mode', mode)
	}

	setTheme(theme){
		this.editor.setOption('theme', theme)
	}

	setSelectionVisible(vis){
		if (vis){
			const sel = this.editor.display.wrapper.getElementsByClassName('CodeMirror-unselected')
			console.log(sel)
			if (sel.length > 0){
				sel[0].className = 'CodeMirror-selected'
			}
		}else{
			const sel = this.editor.display.wrapper.getElementsByClassName('CodeMirror-selected')
			console.log(sel)
			if (sel.length > 0){
				sel[0].className = 'CodeMirror-unselected'
			}
		}
	}

	setCursorVisible(vis){
		if (vis){
			
		}else {
			const el = this.editor.display.wrapper.getElementsByClassName('cm-animate-fat-cursor')[0]
			if (el)
				el.classList.remove('cm-animate-fat-cursor')
		}
	}

	loadSnapshot(snapshot, modifyCursor){
		if (snapshot.hasOwnProperty('code')){
			this.editor.setValue(snapshot.code)
			if (snapshot.hasOwnProperty('cursor')){
				this.editor.display.wrapper.classList.add('CodeMirror-focused')
				this.clearMode()
				switch (snapshot.cursor.mode){
					case 'replace':
					case 'insert':
						//this.setCursorVisible(true)
						//this.setSelectionVisible(false)
						this.editor.display.wrapper.classList.remove('cm-fat-cursor')
						this.editor.setCursor(snapshot.cursor.pos)
						CodeMirror.Vim.handleKey(this.editor, snapshot.cursor.mode === 'insert' ? 'i' : 'R')
						break;
					case 'normal':
						//this.setCursorVisible(true)
						//this.setSelectionVisible(false)
						this.editor.display.wrapper.classList.add('cm-fat-cursor')
						this.editor.setCursor(snapshot.cursor.pos)
						break;
					case 'visual':
						//this.setSelectionVisible(true)
						this.editor.setSelections(snapshot.cursor.selections)
						this.setCursorVisible(false)
						//const el = this.editor.display.wrapper.getElementsByClassName('cm-animate-fat-cursor')[0]
						//if (el)
						//	el.classList.remove('cm-animate-fat-cursor')
						break;
					default:
						break;
				}
				const modeStr = getModeStr(snapshot.cursor.mode, snapshot.cursor.subMode)
				this.setState({vimState: modeStr})
			}else if (modifyCursor){
				//this.setCursorVisible(false)
				//this.setSelectionVisible(false)
				this.editor.display.wrapper.classList.remove('CodeMirror-focused')
			}
		}else{
			this.editor.swapDoc(snapshot)
		}
	}

	getSnapshot(){
		const snap = {
			code: this.editor.getValue(),
			cursor: {
				...this.getCursorMode()
			}
		}
		if (snap.cursor.mode === 'visual')
			snap.cursor.selections = this.editor.doc.sel.ranges
		else
			snap.cursor.pos = {
				line: this.editor.getCursor().line,
				ch: this.editor.getCursor().ch
			}
		return snap;//this.editor.doc.copy()
	}

	comparePos(p1, p2){
		return p1.line === p2.line && p1.ch === p2.ch
	}

	compareRange(r1, r2){
		return (this.comparePos(r1.head, r2.head) && this.comparePos(r1.anchor, r2.anchor)) ||
					(this.comparePos(r1.head, r2.anchor) && this.comparePos(r1.anchor, r2.head))
	}

	compareRanges(rs1, rs2){
		if (rs1.length !== rs2.length){
			return false
		}

		let matches = []
		for (let i = 0; i < rs1.length; i++){
			for (let j = 0; j < rs2.length; j++){
				if (!matches.includes(j) && this.compareRange(rs1[i], rs2[j])){
					matches.push(j)
					break;
				}
			}
		}
		return matches.length === rs1.length
	}

	compareSnapshot(snapshot){
		let res = true
		if (snapshot.hasOwnProperty('code')){
			res = res && this.editor.getValue() === snapshot.code
			if (snapshot.hasOwnProperty('cursor')){
				const mode = this.getCursorMode()
				res = res && (snapshot.cursor.mode === mode.mode) && (snapshot.cursor.subMode === mode.subMode)
				if (snapshot.cursor.mode !== 'visual'){
					const cursor = this.editor.getCursor()
					res = res && this.comparePos(snapshot.cursor.pos, cursor)
				}else {
					res = res && this.compareRanges(this.editor.doc.sel.ranges, snapshot.cursor.selections)
				}
			}
		}else{
			res = res && this.editor.getValue() === snapshot.getValue()
			res = res && this.compareRanges(this.editor.doc.sel.ranges, snapshot.sel.ranges)

			res = false
		}
		return res 
	}

	componentDidMount() {
		const panel = this
		const el = document.getElementById(this.state.id)
		if (el === undefined)
			return
		this.editor = CodeMirror.fromTextArea(el, this.state.options)
		
		// TODO: Allow pasting, initialize recording
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
			mirror.on('keydown', this.state.onKeyPress);
		}
		
		mirror.on('vim-mode-change', function(e) {
			// FIXES GLITCH where user pressed V then R
			//if (e.mode === 'normal')
			//	panel.clearMode()
	  			
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

	onChange(){
		if (this.state.onChange)
			this.state.onChange()
	}
	
	render(){
		return (
			<div className="CodeEditor">
				<textarea id={this.state.id} />
		  	<p className='VimState' >{this.state.vimState}</p>
			</div>
		)
	}

}
