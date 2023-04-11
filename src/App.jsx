import { useState } from 'react';
import './bulma.min.css';
import './App.css';

function App() {
	const dialogueList = [
		{
			id: 0,
			text: "Hello traveler.",
		},
		{
			id: 1,
			text: "Do you like apples or oranges?",
			choices: [
				{
					text: "I declare that oranges are amazing!",
					setVariable: {
						fruitChoice: "oranges"
					},
					jumpTo: 2,
				},
				{
					text: "APPLES!",
					setVariable: {
						fruitChoice: "apples"
					},
					jumpTo: 3,
				},
				{
					text: "None of the above.",
					jumpTo: 4
				}
			]
		},
		{
			id: 2,
			text: "I'll get you some orange juice then.",
			jumpTo: 5
		},
		{
			id: 3,
			text: "I'll get you some apple juice then.",
			jumpTo: 5
		},
		{
			id: 4,
			text: "Fair enough."
		},
		{
			id: 5,
			text: "So what brings you here?"
		},
	];
	const [currentDialogueID, setCurrentDialogueID] = useState(0);
	const [choiceButtons, setChoiceButtons] = useState([]);
	const [showNextButton, setShowNextButton] = useState(true);
	//const [fruitChoice, setFruitChoice] = useState('oranges');

	function nextButton() {
		const currentDialogue = dialogueList[currentDialogueID];
		const nextDialogueID = currentDialogueID + 1;
		const nextDialogue = dialogueList[nextDialogueID];

		if(Object.hasOwn(nextDialogue, 'choices')) {
			const choices = nextDialogue.choices;
			setChoiceButtons(choices);
			setShowNextButton(false);
			setCurrentDialogueID(nextDialogueID);
			//console.log(choices);
		}
		else if(Object.hasOwn(currentDialogue, 'jumpTo')) {
			setCurrentDialogueID(currentDialogue.jumpTo);
			//console.log(currentDialogue.jumpTo);
		}
		else {
			setCurrentDialogueID(nextDialogueID);
		}
	}

	function dialogueChoiceButton(event) {
		const jumpTo = event.target.getAttribute('data-jumpto') * 1;
		setCurrentDialogueID(jumpTo);
		setChoiceButtons([]);
		setShowNextButton(true);
		//console.log(jumpTo);
	}
	
	return (
		<div id='game'>
			<button id='options-button' className='button'>Options</button>
			<button id='inventory-button' className='button'>Inventory</button>
			<div id='choices-view'>
				<div id='choices-list'>
					{choiceButtons.map((button, index) => (
						<button onClick={dialogueChoiceButton} data-jumpto={button.jumpTo} key={index} className='button choice'>{button.text}</button>
					))}
				</div>
			</div>
			<div id='reserves'>
				<output><span id='experience'>0</span> Experience</output>
				<output><span id='money'>0</span> Gold</output>
			</div>
			<div id='primary-textbox' className='card'>
				<p id='primary-textbox-text'>{dialogueList[currentDialogueID].text}</p>
				<button onClick={nextButton} className={`button next-button ${showNextButton ? '' : 'hidden-next-button'}`}>Next</button>
			</div>
		</div>
	);
}

export default App;