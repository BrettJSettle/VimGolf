import './css/TaskBrowser.css'
import {db, auth} from './firebase.js'
const FilterableTable = require('react-filterable-table');
const React = require('react');

export default class TaskBrowser extends React.Component {
	constructor(props){
		super(props)
		const fields = [
			{name: 'title', displayName: 'Title', inputFilterable: true, sortable: true},
			{name: 'author', displayName: 'Author', inputFilterable: true, sortable: true},
			{name: 'description', displayName: 'Description', inputFilterable: true, sortable: true},
			{name: 'buttons', displayName: ''}
		]
		this.state ={
			rows: [],
			fields: fields,
			onClose: props.onClose,
			onLoad: props.onLoad,
		}
	}
	
	removeTask = (taskId) => {
		db.ref('tasks/' + taskId).set(null)
		db.ref('users/fb/' + auth().currentUser.uid + '/tasks/' + taskId).set(null)
		db.ref('solutions/' + taskId).set(null)
		this.state.onClose()
	}

	loadTask = (task) => {
		this.state.onLoad(task)
	}

	componentDidMount(){
		this.getTasks()
	}

	getTasks(){
		const main = this;
		let rows = []
		const tasks = db.ref('tasks')
		if (!tasks)
			return
		tasks.on('value', function(tasks) {
			const taskList = tasks.val()
			if (taskList === null){
				return
			}
			Object.keys(taskList).forEach(function(d) {
				rows.push({
					title: taskList[d].title,
					author: taskList[d].author,
					description: taskList[d].description,
					buttons: <div className="task-row-buttons">
						<button onClick={() => main.loadTask(taskList[d])}>Load</button>
						{auth().currentUser !== null && taskList[d].authorId === auth().currentUser.uid && 
							<button onClick={() => main.removeTask(d)}>Remove</button>
						}
					</div>
				})
			})
			main.setState({rows: rows})
		})
	}


	render() {
		return  (
			<div className="TaskBrowser">
				<div className='TaskBrowser-window'>
					<FilterableTable
						namespace='vimTasks'
						initialSort='title'
						data={this.state.rows}
						fields={this.state.fields}
						noRecordsMessage="There are no tasks available."
						noFilteredRecordsMessage="No results match your search. Be less specific"/>
					<div className='modal-buttons'>
						<button className='cancel' onClick={() => this.state.onClose()}>Cancel</button>
					</div>
				</div>
			</div>
		)
	}
}
