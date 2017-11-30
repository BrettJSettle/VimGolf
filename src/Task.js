import React, {Component} from 'react'
import FA from 'react-fontawesome'
import './css/Task.css'
import Editor from './Editor.js'


export default class TaskView extends Component{
	constructor(props){
		super(props)
		this.editor = undefined
		window.taskView = this
	}

	close(){
		this.setState({isMenuOpen: false})
	}

	componentWillReceiveProps(p){
		if (p['task'])
			this.editor.editor.setValue(p['task']['out'])
	}

	getTaskView = (task) => {
		const main = this;
		const style = {background: this.props.complete ? "green" : "none"}
		return (<div className="Task-content">
				<div className="TaskInfo">
					<div className="TaskTitle">
						<h3>{task.name}<button onClick={this.props.onRestart}><FA name="undo"/></button></h3>
						<a href={"http://vimgolf.com/" + task.url} className="info"><FA name={"embed"}/></a>
					</div>
					<Editor id="goalEditor"
						value={this.props.task.out}
						ref={(a) => main.editor = a }
						editorOptions={{readOnly:'nocursor'}}
						mode={this.props.mode}
						theme={this.props.theme}
						fontSize={this.props.fontSize}/>
				</div>
				<div className="TaskProgress">
					<textarea className="keys" readOnly value={'Keys: ' + this.props.keys.join(', ')} style={style}></textarea>
				</div>
			</div>);
	}

	render(){
		let content = <h2>No Task Selected</h2>;
		const task = this.props.task
		
		if(task !== null && task !== undefined){
			content = this.getTaskView(task)
		}

		return (
		<div className="Task">
			{content}
		</div>
		);
	}
}
