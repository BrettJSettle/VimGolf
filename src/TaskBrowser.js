import './css/TaskBrowser.css'
import React, {Component} from 'react'
import FilterableTable from 'react-filterable-table';

export default class TaskBrowser extends Component {
	constructor(props){
		super(props)
		const fields = [
			{name: 'buttons', displayName: ''},
			{name: 'name', displayName: 'Name', inputFilterable: true, sortable: true},
			{name: 'description', displayName: 'Description', inputFilterable: true, sortable: true},
			{name: 'entries', displayName: 'Entries', inputFilterable: true, sortable: true},
		]
		this.fields= fields
	}

	loadTask = (d) => {
		const main = this
		const ID = d.url.split('/').pop()
		fetch('http://thesettleproject.com/cgi-bin/vimgolf/challenges.py?challenge=' + ID)
		.then(resp => resp.json())
		.then(json => {
			d.in = json['data']['in']
			d.out = json['data']['out']
			main.props.onLoad(d)
		})
	}

	getTasks = () => {
		const main = this
		let rows = []
		this.props.tasks.forEach(function(d) {
				rows.push({
					name: d.name,
					description: d.description,
					entries: d.entries,
					buttons: <div className="task-row-buttons">
						<button onClick={() => main.loadTask(d)}>Load</button>
					</div>
				})
			})
		return rows
	}

	render() {
		const rows = this.props.tasks ? this.getTasks() : []
		return  (
			<div className="TaskBrowser">
				{this.props.tasks.length === 0 ?
					<h3>Loading tasks</h3>
					:
				<FilterableTable
						namespace='vimTasks'
						initialSort='name'
						data={rows}
						fields={this.fields}
						noRecordsMessage="There are no tasks available."
						noFilteredRecordsMessage="No results match your search. Be less specific"/>
				}
			</div>
		)
	}
}
