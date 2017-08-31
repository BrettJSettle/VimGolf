import React from 'react'
import './TaskModal.css'
import CodeEditor from './CodeEditor.js'

export default class TaskModal extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			author: props.task.author || '',
			authorId: props.task.authorId || '',
			title: props.task.title || '',
			task: props.task,
			description: props.task.description || '',
			onClose: props.onClose,
			modeState: true,
			themeState: true,
			cursorState: true,
		}
		this.goalEditor = null;
		this.startEditor = null;
	}

	componentDidMount(){
		this.startEditor.loadSnapshot(this.state.task.start)
		this.startEditor.setMode(this.state.task.mode)
		this.startEditor.setTheme(this.state.task.theme)
		this.goalEditor.loadSnapshot(this.state.task.goal)
		this.goalEditor.setMode(this.state.task.mode)
		this.goalEditor.setTheme(this.state.task.theme)

		document.getElementById('title').focus()
	}


	onSave = () => {
		if (this.state.authorId === '' || this.state.title === '')
			return;
		
		const item = {
			title: this.state.title,
			authorId: this.state.authorId,
			author: this.state.author,
			description: this.state.description,
			solution: this.state.task.solution.toString(),
			startCursor: JSON.stringify(this.state.task.start.cursor),
			startCode: this.state.task.start.code,
			goalCode: this.state.task.goal.code,
			goalCursor:JSON.stringify(this.state.task.goal.cursor),
		}
		if (!this.state.cursorState){
				delete item.startCursor 
				delete item.goalCursor 
		}
		if (this.state.modeState){
			item.mode = this.state.task.mode
		}
		if (this.state.themeState)
			item.theme = this.state.task.theme

		this.upload(item)
		this.close()
	}

	upload(task){
		console.log(task)
		//'http://vim-task-service-dev.us-west-2.elasticbeanstalk.com/tasks',
		fetch('/tasks', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				"Access-Control-Allow-Origin": "*",
				},
				body: JSON.stringify(task)

		}).then(function(body){
			console.log(body)
		})

	}

	close(a){
		this.state.onClose()
	}

	valueChanged(key, value){
		this.setState({[key]: value})
		if (key === 'cursorState'){
			this.startEditor.setCursorVisible(value)
			this.goalEditor.setCursorVisible(value)
		}
	}

	render(){
		const task = this.state.task
		const startOptions = {
			lineNumbers: true,
			keyMap: 'vim',
			dragDrop: false,
			readOnly: 'nocursor',
		}
		const endOptions = {
			lineNumbers: true,
			keyMap: 'vim',
			dragDrop: false,
			readOnly: 'nocursor',
		}
		return (
			<div className="modal-background">
				<div className="modal-backdrop"/ >
				<div className='modal'>
					<div className="left">
						<label htmlFor='title'>Title</label>
						<input
							id='title'
							type='text'
							maxLength={100}
							defaultValue={task.title}
							onChange={(e) => this.valueChanged('title', e.target.value)}/>
						<label htmlFor='description'>Description</label>
						<textarea
							id='description'
							maxLength={100}
							onChange={(e) => this.valueChanged('description', e.target.value)}/>
						<label htmlFor='author' >Author</label>
						<input
							id='author'
							type='text'
							defaultValue={this.state.author}
							disabled
							onChange={(e) => this.valueChanged('author', e.target.value)}/>
						<label htmlFor='solution'>Solution</label>
						<textarea id='solution' type='text' disabled defaultValue={task.solution}/>
						<input
							id='cursor'
							type="checkbox"
							checked={this.state.cursorState}
							onChange={(e) => this.valueChanged('cursorState', !this.state.cursorState)}/>
						<label htmlFor='cursor'>Require Cursor Match</label>
						<br />
						<input
							id='mode'
							type="checkbox"
							checked={this.state.modeState}
							onChange={(e) => this.valueChanged('modeState', !this.state.modeState)}/>
						<label htmlFor='cursor'>Mode {this.state.task.mode}</label>
						<br />
						<input
							id='theme'
							type="checkbox"
							checked={this.state.themeState}
							onChange={(e) => this.valueChanged('themeState', !this.state.themeState)}/>
						<label htmlFor='cursor'>Theme {this.state.task.theme}</label>
						
						
						
						<div className="modal-buttons">
							<input className="submit" type="submit" onClick={this.onSave} value="Submit"/>
							<input className="cancel" type="submit" onClick={() => this.state.onClose()} value="Cancel"/>
						</div>
					</div>

					<div className="right">
						<div className="text">
							<CodeEditor
								id="modal-start"
								value={task.start.code}
								options={startOptions}
								ref={(e) => this.startEditor = e}/>
							{/*<textarea id='modal-start' value={task.start.code} disabled/>*/}
						</div>
						<i className="fa fa-arrow-down" aria-hidden="true"></i>	
						<div className="text">
							<CodeEditor
								id="modal-goal"
								value={task.goal.code}
								options={endOptions}
								ref={(e) => this.goalEditor = e}/>
							{/*<textarea id="modal-goal" value={task.goal.code} disabled/>*/}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
