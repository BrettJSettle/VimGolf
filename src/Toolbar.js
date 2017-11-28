import React, {Component} from 'react'
import {themes, modes} from './constants.js'
import './css/Toolbar.css'

const Toolbar = (props) => {
	const themeOptions = themes.map(function(theme, k){
		return <option key={k} value={theme}>{theme}</option>
	})
	const modeOptions = modes.map(function(mode, k){
		return <option key={k} value={mode}>{mode}</option>
	})
	return (
		<div className="Toolbar">
			<ul className="button-list">
				<li>
					<input className="fontSize" type="number" onChange={(v) => {
						props.onChange("fontSize", v.target.value)
					}} value={props.fontSize}/>
				</li>
				<li>
					<select className="theme" value={props.theme}
						onChange={v => {props.onChange("theme", v.target.value) }}>
						{themeOptions}
					</select>
				</li>
				<li>
					<select className="mode" value={props.mode}
						onChange={v => {props.onChange("mode", v.target.value)}}>
						{modeOptions}
					</select>
				</li>
			</ul>
			<ul className="button-list right">
				<li>
					<button className="browse" onClick={props.toggleBrowser}>{props.browsing ? "View Task" : "Browse Tasks"}</button>
				</li>
			</ul>
		</div>
	)
}
export default Toolbar;
