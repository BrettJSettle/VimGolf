import React from 'react';
import './Task.css'
import './checkbox.css'
import CodeEditor from './CodeEditor.js'
var FontAwesome = require('react-fontawesome')

export default function Task({keys, task, complete, onReset, onNext, onSearch, editorRef}) {
  const com = 'Commands:\n' + keys.join(', ')
	
	const options = {
		lineNumbers: true,
		keyMap: 'vim',
		dragDrop: false,
		readOnly: 'nocursor',
	}

	
	return (
	<div className={"Task main-row " + (complete ? "Task-complete" : "")}>
		<div className="Task-header">
			<h2 className="Task-title">{task.title}
				<span className="author">{task.author}</span>
				{(task.description !== undefined && task.description.length >= 0) && 
					<FontAwesome
						name='info-circle'
						title={task.description} />
				}
			</h2>
			<div className="Task-buttons">
				<button className='Task-clickable Task-search' title="Search" onClick={onSearch}>
					<FontAwesome
						name="search" />
				</button>
				<button className='Task-clickable Task-next' title="Next" onClick={onNext}>
					<FontAwesome
						name="step-forward" />
				</button>
				<button className='Task-clickable Task-reset' title="Reset" onClick={onReset}>
					<FontAwesome
						name="refresh" />
				</button>
			</div>
		</div>
		<div className="Task-row">
			<CodeEditor id="goal" ref={editorRef} options={options}/>
			<textarea className="Task-keys" readOnly='true' value={com}/>
			<div className="checkbox checkbox-info checkbox-circle">
		 		<input disabled checked={complete} id="checkbox8" className="styled" type="checkbox" />
	   		<label htmlFor="checkbox8"></label>
			</div>
		</div>
	</div>
  );
}
