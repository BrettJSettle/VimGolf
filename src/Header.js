import React from 'react'
import './css/Header.css'

export default function Header({title, subtitle}) {
	return (
		<div className="Header">
			<h1>{title}</h1>
			<p>{subtitle}</p>
		</div>
	);
}
