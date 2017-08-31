import React, { Component } from 'react';
import TaskBrowser from './TaskBrowser.js'
import Editor from './Editor.js'
import RecordPanel from './RecordPanel.js'

require('codemirror/keymap/vim.js')
require('codemirror/addon/selection/mark-selection.js')
require ('./css/VimGolf.css');
require('codemirror/lib/codemirror.css');
require('codemirror/addon/dialog/dialog.css')


export default class VimGolf extends Component {
  constructor(props){
		super();
		this.state = {
			keys: [],
			currentTask: false,
			mode: 'edit',
			browsing: false
		}
		this.editor = null
		this.recordPanel = <RecordPanel />
	}

  componentDidMount(){
		this.editor.editor.focus()
	}

	onChange(){
	
	}

  render() {
		const main = this;
		return (
	 		<div className='VimGolf'>
				<div className="main-row CodePanel">
					<Editor id="editor"
						ref={(a) => main.editor=a }
						onChange={() => main.onChange()}
						onKeyPress={(e, f) => main.onKeyPress(this, f)}
						toolbar={this.recordPanel}/>
					<div className="control-container">
						<div className="div-left">
							<ul className="button-tab">
								<li>
									<button className="Browse" onClick={() => main.setState({browsing: true})}>Browse Tasks</button>
								</li>
							</ul>
						</div>
					</div>
					{this.state.browsing && 
						<TaskBrowser
							onClose={(task) => {
								console.log(task)
								main.setState({browsing: false})
							}}
						/>
					}
				</div>
	  	</div>
    );
  }
}
