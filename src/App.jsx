import {useState, useRef} from 'react';
import './bulma.min.css';
import './App.css';

function App() {
	const [playerHealth, setPlayerHealth] = useState(1);
	const [playerMagic, setPlayerMagic] = useState(1);
	const [experience, setExperience] = useState(0);
	const [money, setMoney] = useState(0);
	
	const fruitChoice = useRef('non-existent fruits');

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
					number: 1,
					text: "I declare that oranges are amazing!",
					doAction: () => {fruitChoice.current = "oranges"},
					jumpTo: 2,
				},
				{
					number: 2,
					text: "APPLES!",
					doAction: () => {fruitChoice.current = "apples"},
					jumpTo: 3,
				},
				{
					number: 3,
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
		{
			id: 6,
			text: `I assume it's for more than just looking for ${fruitChoice.current}.`
		}
	];
	
	const [currentDialogueID, setCurrentDialogueID] = useState(0);
	const [choices, setChoices] = useState([]);
	const [showNextButton, setShowNextButton] = useState(true);

	function nextButton() {
		const currentDialogue = dialogueList[currentDialogueID];
		const nextDialogueID = currentDialogueID + 1;
		const nextDialogue = dialogueList[nextDialogueID];

		if(Object.hasOwn(nextDialogue, 'choices')) {
			const choices = nextDialogue.choices;
			setChoices(choices);
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
		const number = event.target.getAttribute('data-number') * 1;
		const variableFunction = dialogueList[currentDialogueID].choices?.find(choice => choice.number === number);

		// Run method only if the object contains it, from dfsq on StackOverflow: https://stackoverflow.com/questions/14961891/how-to-check-if-an-object-has-a-function-dojo
		if(typeof variableFunction.doAction === 'function') {
			variableFunction.doAction();
		}

		const jumpTo = event.target.getAttribute('data-jumpto') * 1;
		setCurrentDialogueID(jumpTo);
		setChoices([]);
		setShowNextButton(true);
		//console.log(jumpTo);
	}

	const choiceButtons = choices.map(choice => (
		<button onClick={dialogueChoiceButton} data-number={choice.number} data-jumpto={choice.jumpTo} key={choice.text} className='button choice'>{choice.text}</button>
	));
	
	return (
		<div id='game'>
			<button id='options-button' className='button'>Options</button>
			<button id='inventory-button' className='button'>Inventory</button>
			<div id='choices-view'>
				<div id='choices-list'>
					{choiceButtons}
				</div>
			</div>
			<div id='reserves'>
				<output><span id='experience'>{experience}</span> Experience</output>
				<output><span id='money'>{money}</span> Gold</output>
			</div>
			<div id='primary-textbox' className='card'>
				<p id='primary-textbox-text'>{dialogueList[currentDialogueID].text}</p>
				<button onClick={nextButton} className={`button next-button ${showNextButton ? '' : 'hidden-next-button'}`}>Next</button>
			</div>
		</div>
	);
}

export default App;