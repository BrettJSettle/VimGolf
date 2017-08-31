import React from 'react';
import Dropdown from 'react-dropdown';
import {themeItems, modeItems} from './constants.js';
import 'react-dropdown/style.css'

require('./ControlBar.css')

export default function ControlBar({enabled, recording, onRecord, handleMode, handleTheme, mode, theme}){
	return (
	  <div className='ControlBar horizBar'>

			{enabled && (recording ?
				<div className="Record-div">
					<button id="recordButton" title="Finish Recording" className='Stop-Record Control-Button' onClick={onRecord}>
						<i className="fa fa-check" aria-hidden="true"></i>
					</button>
					<button title="Cancel" className='Cancel-Record Control-Button' onClick={() => onRecord(true)}>
						<i className="fa fa-close" aria-hidden="true"></i>
					</button>
				</div>
				:
				<div className="Record-div">
					<button id="recordButton" title="Record" className='Record Control-Button' onClick={onRecord}>
						<i className="fa fa-circle" aria-hidden="true"></i>
					</button>
					<p style={{float: 'right', color: "white", margin: '5px', lineHeight: '1.5'}}>Record a New Task</p>
				</div>
			)}
			<div className='dropDiv'>
		  	<Dropdown placeholder='Mode' onChange={handleMode} value={mode} options={modeItems}/>
			</div>
			<div className='dropDiv'>
		  	<Dropdown placeholder='Theme' onChange={handleTheme} value={theme} options={themeItems}/>
			</div>
	  </div>
	)
}
