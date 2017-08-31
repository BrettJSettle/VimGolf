import './css/TaskBrowser.css'
import {db, provider, auth} from './firebase.js'
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
			authorId: props.authorId,
			fields: fields,
			onClose: props.onClose,
			onLoad: props.onLoad
		}
	}

	componentDidMount(){
		this.getTasks()
	}

	remove(obj){
	}

	load(res){
		if (res.id === undefined){
			return
		}

		let obj = {
			title: res.title,
			author: res.author,
			description: res.description,
			solution: res.solution,
			start: {
				code: res.startCode,
			},
			goal: {
				code: res.goalCode,
			}
		}

		if (res.startCursor !== null){
			obj.start.cursor = JSON.parse(res.startCursor)
		}
		if (res.goalCursor !== null){
			obj.goal.cursor = JSON.parse(res.goalCursor)
		}
		if (res.mode !== null){
			obj.mode = res.mode
		}
		if (res.theme !== null){
			obj.theme = res.theme
		}
		

		this.state.onLoad(obj)
	}

	getTasks(){
		//const main = this;
		const tasks = db.ref('tasks')
		tasks.on('value', function(val) {
			console.log(val)
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
