import React, { Component } from 'react';
import SplitPane from 'react-split-pane'
import Header from './Header.js'
import Editor from './Editor.js'
import Task from './Task.js'
import TaskBrowser from './TaskBrowser.js'
import Toolbar from './Toolbar.js'

import './css/App.css';
import './css/bootstrap.min.css';

class App extends Component {
	constructor(){
		super()
		this.state = {
			keys: [],
			task: undefined, 
			tasks: [],
			browsing: false,
			mode: 'javascript',
			theme: 'monokai',
			fontSize: 12,
			complete: false
		}
		this.editor = null
	}

	onKeyPress = (k) => {
		if (this.state.complete)
			return
		let newKeys = this.state.keys.slice()
		newKeys.push(k)
		let complete = false

		let value = this.editor.editor.getValue()

		if (value === this.state.task.out){
			complete = true
		}
		this.setState({keys: newKeys, complete: complete})
	}

	toggleBrowser = () => {
		const browsing = this.state.browsing;
		this.setState({browsing: !browsing})
		if (this.state.tasks.length === 0){
			const main = this;
			fetch('http://thesettleproject.com/cgi-bin/vimgolf/challenges.py')
			.then(resp => resp.json())
			.then(json => {
				if (json['data']){
					main.setState({tasks: json['data']})
				}
			})
		}
	}

	onLoad = (task) => {
		this.setState({task: task, keys:[], complete:false, browsing: false})
		this.editor.editor.setValue(task['in'])
		window.taskView.editor.editor.setValue(task['out'])
	}

	render() {
		const main = this;
    return (
      <div className="App">
				<Header title="Vim Golf" subtitle="Test your vim skills in an interactive playground"/>
				<Toolbar
					mode={this.state.mode}
					theme={this.state.theme}
					fontSize={this.state.fontSize}
					browsing={this.state.browsing}
					onChange={(k, v) => {
						console.log(k + ' ' + v)
						main.setState({k, v})
					}}
					toggleBrowser={main.toggleBrowser}
				/>
				{this.state.browsing ?
					<TaskBrowser
						tasks={this.state.tasks}
						onClose={() => {main.setState({browsing: false}) }}
						onLoad={(task) => {main.onLoad(task)}}
					/>
					:
				<SplitPane split="vertical" defaultSize="50%" className="VimGolf-split" minSize={350} maxSize="90%">
					<Editor id="editor"
						fontSize={this.state.fontSize}
						mode={this.state.mode}
						theme={this.state.theme}
						ref={(a) => main.editor = a }
						onKeyPress={(k) => main.onKeyPress(k)}
					/>
					<Task
						mode={this.state.mode}
						theme={this.state.theme}
						fontSize={this.state.fontSize}
						task={this.state.task}
						onRestart={() => {main.onLoad(main.state.task)}}
						complete={this.state.complete}
						keys={this.state.keys}/>
				</SplitPane>}
			</div>
    );
  }
}

export default App;
