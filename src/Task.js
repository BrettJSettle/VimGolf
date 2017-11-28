import React, {Component} from 'react'
import FA from 'react-fontawesome'
import './css/Task.css'
import DropdownMenu from 'react-dd-menu';

var CodeMirror = require('codemirror');

export default class TaskView extends Component{
	constructor(props){
		super(props)
		this.state = {
			task: props.task,
			keys: [],
			taskInfo: false,
			complete: false,
			isMenuOpen: false,
			onRestart: props.onRestart,
		}
		window.t = this
	}

	componentDidMount(){
		const options = {
			lineNumbers: true,
			dragDrop: false,
			smartIndent: false,
			fontSize: 20,
			matchBrackets: true,
			readOnly: 'nocursor'
		}

	}

	infoClicked = () => {
		this.setState({taskInfo: !this.state.taskInfo})
	}

	keyPressed(key){

		if (this.state.complete){
			return
		}
		let keys = this.state.keys.slice()
		keys.push(key)
		this.setState({keys})
	}

	restart = () => {
		this.state.onRestart()
		this.setState({keys: []})
	}

	close(){
		this.setState({isMenuOpen: false})
	}

	getTaskView = () => {
		const main = this;
		const style = {background: this.state.complete ? "green" : "none"}
		const menuOptions = {
		  isOpen: this.state.isMenuOpen,
			close: () => main.setState({isMenuOpen: false}),
			toggle: <button type="button" onClick={() => this.setState({isMenuOpen: !this.state.isMenuOpen})}><FA name="ellipsis-v"/></button>,
			align: 'right'
		};
		return (<div className="Task-content">
				<div className="TaskInfo">
					<div className="TaskTitle"><h3>{this.state.task.title}</h3><p className="author">by {this.state.task.author}</p><button onClick={this.infoClicked} className="info"><FA name={!this.state.taskInfo ? "info-circle" : "play-circle"}/></button></div>
					<textarea id="goalEditor" value={this.state.taskInfo === true ? this.state.task.description : this.state.task.goal.text} readOnly></textarea>
				</div>
				<div className="TaskProgress">
					<div className="TaskTitle"><p>Keys:</p></div>
					<textarea className="keys" readOnly value={this.state.keys.join(', ')} style={style}></textarea>
				</div>
				<div className="TaskButtons">
					<DropdownMenu {...menuOptions}>
						<li><button onClick={this.restart} >Restart</button></li>
					</DropdownMenu>
				</div>
			</div>);
	}

	render(){
		const main = this
		let content = <h2>No Task Selected</h2>;
		if(this.state.task !== null && this.state.task !== undefined){
			content = this.getTaskView()
		}

		return (
		<div className="Task">
			{content}
		</div>
		);
	}
}
