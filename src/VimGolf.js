import React, { Component } from 'react';
import {SplitPane} from 'react-split-pane'
import TaskBrowser from './TaskBrowser.js'
import {taskComplete} from './constants.js'
import ToolBar from './ToolBar.js'
import TaskView from './TaskView.js'
import Editor from './Editor.js'

require('codemirror/keymap/vim.js')
require('codemirror/addon/selection/mark-selection.js')
require ('./css/VimGolf.css');
require('codemirror/lib/codemirror.css');
require('codemirror/addon/dialog/dialog.css')


var CM = require('codemirror')
window.CM = CM

export default class VimGolf extends Component {
  constructor(props){
		super();
		this.state = {
			currentTask: null,
			user: null,
			mode: 'editor',
			browsing: false
		}
		this.editor = null
		this.taskPanel = null
	}

  componentDidMount(){
		this.editor.editor.focus()
		const comp = this
	}

	onChange(){
		if (this.state.mode === 'tasks' && !this.taskPanel.state.complete){
			var complete = taskComplete(this.editor.editor, this.state.currentTask)
			this.taskPanel.setState({complete: complete})
		}
	}

	loadTask = (task) => {
		this.editor.loadState(task.start)
		this.setState({currentTask: task, browsing: false})
		this.taskPanel.setState({complete: false})
	}

	onKeyPress = (key) => {
		if (this.state.mode === 'tasks')
			this.taskPanel.keyPressed(key)
	}

	onModeChange = (v) => {
		this.setState({mode: v.value})
		this.onRestart()
	}

	onRestart = () => {
		this.loadTask(this.state.currentTask)
	}


	render() {
		const main = this;
		return (
			<div className="VimGolf">
				<ToolBar />
				<SplitPane split='vertical' defaultSize={300} className="VimGolf-split">
					<Editor id="editor"
						ref={(a) => main.editor = a }
						onKeyPress={(k) => main.onKeyPress(k)}
						onChange={() => main.onChange()}
					/>
					<TaskView />
				</SplitPane>
			</div>
		)
	}
/*
  render_old() {
		const main = this;
		const modes = [
			{label: 'editor', value: 'editor'},
			{label: 'tasks', value: 'tasks'}
		]
		return (
	 		<div className='VimGolf'>
				<div className="main-row CodePanel">
					<Editor id="editor"
						ref={(a) => main.editor = a }
						onKeyPress={(k) => main.onKeyPress(k)}
						onChange={() => main.onChange()}
					/>
					<div className="control-container">
						<div className="div-left">
							<ul className="button-tab">
								{this.state.mode === 'tasks' && 
								<li>
									<button className="Browse" onClick={() => main.setState({browsing: true})}>Browse Tasks</button>
								</li>
								}
							</ul>
						</div>
						<div className="div-right">
							<ul className="button-tab">
								<li>
									<Select
										clearable={false}
										name="mode-select"
										value={this.state.mode}
										autosize={false}
										style={{width: '100px', outline: 'none'}}
										options={modes}
										onChange={this.onModeChange}
									/>
								</li>
							</ul>
						</div>
					</div>
					{this.state.browsing && 
						<TaskBrowser
							onLoad={main.loadTask}
							onClose={() => {
								main.setState({browsing: false})
							}}
						/>
					}
				</div>
	  	</div>
    );
  }
	*/
}
