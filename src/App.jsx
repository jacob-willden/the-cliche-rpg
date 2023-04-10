import { useState } from 'react';
import './bulma.min.css';
import './App.css';

function App() {
	return (
		<div id='game'>
			<button id='options-button' className='button'>Options</button>
			<button id='inventory-button' className='button'>Inventory</button>
			<div id='choices-view'>
				<div id='choices-list'>
					<button className='button choice'>Foo</button>
					<button className='button choice'>Bar</button>
					<button className='button choice'>Baz</button>
				</div>
			</div>
			<div id='reserves'>
				<output><span id='experience'>0</span> Experience</output>
				<output><span id='money'>0</span> Gold</output>
			</div>
			<div id='primary-textbox' className='card'>
				<p id='primary-textbox-text'>Hello World!</p>
				<button className='button next-button'>Next</button>
			</div>
		</div>
	);
}

export default App;