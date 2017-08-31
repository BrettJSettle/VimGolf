import FA from 'react-fontawesome'
import React, {Component} from 'react'
import {provider, auth, db} from './firebase.js'

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

export default class RecordPanel extends Component {
	constructor(props){
		super(props)
		this.state = {
			recording: null,
			user: null,
			onRecordStart: props.onRecordStart,
			onRecordFinish: props.onRecordFinish,
		}
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
		const comp = this;
		return (
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
	)
	}
}
