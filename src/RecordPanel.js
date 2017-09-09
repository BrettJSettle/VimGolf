import FA from 'react-fontawesome'
import React, {Component} from 'react'
import {provider, auth, db} from './firebase.js'
import './css/RecordPanel.css'
import {serialize} from './constants.js'


export default class RecordPanel extends Component {
	constructor(props){
		super(props)
		this.state = {
			recording: null,
			saving: false,
			title:'',
			description: '',
		}
		this.editor = null
	}
	
	record = () => {
		var recording = {
			start: {
				text: this.editor.getValue(),
				selections: serialize(this.editor.listSelections())
			},
			goal: null,
			solution: []
		}
		this.setState({recording: recording})
		this.editor.focus()
	}

	loadState(state){
		this.editor.setValue(state.text)
		this.editor.setSelections(state.selections)
	}

	finishedRecording = (val) => {
		var newState = {}
		if (val === true){
			let rec = Object.assign({}, this.state.recording)
			rec.goal = {
				text: this.editor.getValue(),
				selections: serialize(this.editor.listSelections())
			}
			newState = {saving: true, recording: rec, title: '', description: ''}
		}else{
			newState.recording = null
			this.editor.focus()
		}
		this.setState(newState)
		this.loadState(this.state.recording.start)
	}

	login = () => {
		auth().signInWithPopup(provider)
		//TODO this just works somehow?
	}

	logout = () => {
		auth().signOut()
	}

	keyPressed(key){
		let rec = Object.assign({}, this.state.recording)
		rec.solution.push(key)
		this.setState({recording: rec})
	}

	userTaskCount = () => {
		const uid = auth().currentUser.uid
		db.ref('tasks/' + uid).on('value', function(a){
			if (Object.keys(a).length > 1){
				alert("You haev " + a.length + " tasks. Delete some to create more")
			}
		})
	}

	saveRecording = () => {
		
		const title = this.state.title
		const description = this.state.description
		const author = auth().currentUser.displayName
		const uid = auth().currentUser.uid
		

		const task = {start: this.state.recording.start,
			goal: this.state.recording.goal,
			description: description,
			title: title,
			author: author,
			authorId: uid
		}
		
		const key = db.ref().child('tasks').push().key

		db.ref('tasks/' + key).set(task)
		db.ref('users/fb/' + uid + '/tasks/' + key).set(true)
		db.ref('users/fb/' + uid + '/name').set(author)
		db.ref('solutions/' + key).set(this.state.recording.solution)
		
		this.setState({saving: false, recording: null, title:"", description: ""})
		this.editor.focus()
	}

	render(){
		const comp = this;
		return (
			<div className="div-left">
				{this.state.saving &&
					<div className="save-backdrop">
						<div className="save-dialog">
							<div>
								<p>Title:</p>
								<input name="title" placeholder="Title" value={this.state.title} onChange={(a)=> this.setState({title: a.target.value})}/>
								<p>Description:</p>
								<textarea name="description" placeholder="Description" value={this.state.description} onChange={(a)=> this.setState({description: a.target.value})}/>
								<p>Author: {auth().currentUser.displayName}</p>
								<div>
									<input onClick={() => comp.setState({recording: null, saving: false})} value="Cancel" type="button" readOnly/>
									{(this.state.title && this.state.description) && 
										<input type="submit" value="Save" readOnly onClick={this.saveRecording} />
									}
								</div>
							</div>
						</div>
					</div>
				}
				{auth().currentUser === null ?
				<ul className="button-tab">
					<li>
						<button placeholder="Login to Facebook to save tasks" onClick={this.login} className="Login">Login</button>
					</li>
				</ul> :
				this.state.recording !== null ?
				<ul className="button-tab">
					{this.state.recording.solution.length > 0 &&
					<li>
						<button placeholder="Save as new task" className="StopRecord"onClick={() => comp.finishedRecording(true)}><FA name="check"/></button>
					</li>}
					<li>
						<button placeholder="Cancel task" className="CancelRecord" onClick={() => comp.finishedRecording(false)}><FA name="times"/></button>
					</li>
				</ul>
				:
				<ul className="button-tab">
					<li>
						<button placeholder="Record a new task" className="Record" onClick={comp.record}><FA name="circle"/></button>
					</li>	
					<li> {auth().currentUser !== null ? <p>Hi {auth().currentUser.displayName.split(' ')[0]} </p> : <p />}
						<button className="Logout" onClick={this.logout} >Logout</button>
					</li>
				</ul>
				}
			</div>
		)
	}
}
