import {useState, useRef} from 'react';
import './bulma.min.css';
import './App.css';

function App() {
	const [playerHealth, setPlayerHealth] = useState(1);
	const playerHealthRef = useRef();
	playerHealthRef.current = playerHealth; // Set as both useState and useRef, from Brandon on StackOverflow: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
	
	const [playerMagic, setPlayerMagic] = useState(1);
	const playerMagicRef = useRef();
	playerMagicRef.current = playerMagic;

	const [maxPlayerHealth, setMaxPlayerHealth] = useState(100);
	const maxPlayerHealthRef = useRef();
	maxPlayerHealthRef.current = maxPlayerHealth;

	const [maxPlayerMagic, setMaxPlayerMagic] = useState(100);
	const maxPlayerMagicRef = useRef();
	maxPlayerMagicRef.current = maxPlayerMagic;

	const [experience, setExperience] = useState(0);
	const [money, setMoney] = useState(0);
	const oldDialoguePlace = useRef(0);

	const enemyName = useRef('');
	const enemyHealth = useRef(1);
	
	const damage = useRef(0);
	const magicChoice = useRef('');
	const itemChoice = useRef('');
	const itemResult = useRef('');
	const gainedExperience = useRef(0);
	const gainedMoney = useRef(0);

	const [choices, setChoices] = useState([]);
	const choicesRef = useRef();
	choicesRef.current = choices;
	
	const fruitChoice = useRef('non-existent fruits');

	const dialogueList = [
	    {
			id: 0,
			text: `You entered a battle with a ${enemyName.current}.`
		},
		{
			id: 1,
			text: "What will do you for this turn?",
			choices: [
				{
					number: 1,
					text: "Melee",
					doAction: () => console.log("melee + enemy attack"),
					jumpTo: 4,
				},
				{
					number: 2,
					text: "Magic",
					jumpTo: 2,
				},
				{
					number: 3,
					text: "Items",
					jumpTo: 3,
				}
			]
		},
		{
			id: 2,
			text: "Which magic move will you use?",
			choices: [
				{
					number: 1,
					text: "Go Back",
					jumpTo: 1,
				},
				{
					number: 2,
					text: "Magic spell 1",
					doAction: () => console.log("magic spell 1 + enemy attack"),
					jumpTo: 5,
				},
			]
		},
		{
			id: 3,
			text: "Which item will you use?",
			choices: [
				{
					number: 1,
					text: "Go Back",
					jumpTo: 1,
				},
				{
					number: 2,
					text: "Item 1",
					doAction: () => console.log("item 1 + enemy attack"),
					jumpTo: 6,
				},
			]
		},
		{
			id: 4,
			text: `You used your melee attack, the enemy took ${damage.current} damage.`,
			jumpTo: enemyHealth.current > 0 ? 7 : 8
		},
		{
			id: 5,
			text: `You used the ${magicChoice.current} magic attack, the enemy took ${damage.current} damage.`,
			jumpTo: enemyHealth.current > 0 ? 7 : 8
		},
		{
			id: 6,
			text: `You used the ${itemChoice.current} item, ${itemResult.current}.`,
			jumpTo: enemyHealth.current > 0 ? 7 : 8
		},
		{
			id: 7,
			text: `The ${enemyName.current} attacks, you take ${damage.current} damage.`,
			jumpTo: playerHealthRef.current > 0 ? 1 : 10
		},
		{
			id: 8,
			text: `The ${enemyName.current} fell!`,
		},
		{
			id: 9,
			text: `You won the battle! You got ${gainedExperience.current} experience points and ${gainedMoney.current} gold!`,
			jumpTo: oldDialoguePlace.current
		},
		{
			id: 10,
			text: "You lost all your health points and fell! Do you want to start the battle again?",
			choices: [
				{
					number: 1,
					text: "Yes.",
					doAction: () => console.log("reset variables"),
					jumpTo: 0
				},
				{
					number: 2,
					text: "No.",
					doAction: () => console.log("end game"),
					jumpTo: 11
				},
			]
		},
		{
			id: 11,
			text: "Hello traveler.",
		},
		{
			id: 12,
			text: "Do you like apples or oranges?",
			choices: [
				{
					number: 1,
					text: "I declare that oranges are amazing!",
					doAction: () => {fruitChoice.current = "oranges"},
					jumpTo: 13,
				},
				{
					number: 2,
					text: "APPLES!",
					doAction: () => {fruitChoice.current = "apples"},
					jumpTo: 14,
				},
				{
					number: 3,
					text: "None of the above.",
					jumpTo: 15
				}
			]
		},
		{
			id: 13,
			text: "I'll get you some orange juice then.",
			jumpTo: 16
		},
		{
			id: 14,
			text: "I'll get you some apple juice then.",
			jumpTo: 16
		},
		{
			id: 15,
			text: "Fair enough."
		},
		{
			id: 16,
			text: "So what brings you here?"
		},
		{
			id: 17,
			text: `I assume it's for more than just looking for ${fruitChoice.current}.`
		}
	];

	const [currentDialogueID, setCurrentDialogueID] = useState(11);

	function startBattle(enemy) {
		enemyName.current = enemy.name;
		enemyHealth.current = enemy.health;
		gainedExperience.current = enemy.experience;
		gainedMoney.current = enemy.money;
		
		oldDialoguePlace.current = currentDialogueID;
		//console.log(oldDialoguePlace.current);
		setCurrentDialogueID(0);
	}

	const [showNextButton, setShowNextButton] = useState(true);

	function nextButton() {
		const currentDialogue = dialogueList[currentDialogueID];

		let nextDialogueID;

		if(Object.hasOwn(currentDialogue, 'jumpTo')) {
			nextDialogueID = currentDialogue.jumpTo;
		}
		else {
			nextDialogueID = currentDialogueID + 1;
		}

		const nextDialogue = dialogueList[nextDialogueID];

		//console.log('nextDialogue:', nextDialogue);

		if(Object.hasOwn(nextDialogue, 'choices')) {
			const choices = nextDialogue.choices; //dialogueList[currentDialogue.jumpTo].choices;
			//console.log('choices:', choices);
			setChoices(choices);
			setShowNextButton(false);
			//console.log(choices);
		}
		setCurrentDialogueID(nextDialogueID);
	}

	function dialogueChoiceButton(event) {
		const number = event.target.getAttribute('data-number') * 1;
		const variableFunction = dialogueList[currentDialogueID].choices?.find(choice => choice.number === number);

		// Run method only if the object contains it, from dfsq on StackOverflow: https://stackoverflow.com/questions/14961891/how-to-check-if-an-object-has-a-function-dojo
		if(typeof variableFunction.doAction === 'function') {
			variableFunction.doAction();
		}

		const jumpTo = event.target.getAttribute('data-jumpto') * 1;
		const nextChoices = dialogueList[jumpTo].choices;
		if(nextChoices) {
			setChoices(nextChoices);
		}
		else {
			setChoices([]);
			setShowNextButton(true);
		}

		setCurrentDialogueID(jumpTo);
	}

	const [modalVisible, setModalVisible] = useState(false);

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
				<output>
					Health: <span id='health'>{playerHealth}</span> / <span id='max-health'>{maxPlayerHealth}</span>
				</output>
				<output>
					Magic: <span id='magic'>{playerMagic}</span> / <span id='max-magic'>{maxPlayerMagic}</span>
				</output>
				<output>
					Experience: <span id='experience'>{experience}</span>
				</output>
				<output>
					Gold: <span id='money'>{money}</span>
				</output>
			</div>
			<div id='primary-textbox' className='card'>
				<p id='primary-textbox-text'>{dialogueList[currentDialogueID].text}</p>
				<button onClick={nextButton} className={`button next-button ${showNextButton ? '' : 'hidden-next-button'}`}>Next</button>
			</div>
			<div className={`modal ${modalVisible ? 'is-active' : ''}`}>
				<div className='modal-background'></div>
				<div className='modal-content'>
					<div className='box'>
						modalContent
					</div>
				</div>
				<button onClick={() => {setModalVisible(false)}} className='modal-close is-large' aria-label='Close'></button>
			</div>
			<button onClick={() => startBattle({name: 'Slime', health: 10, experience: 5, money: 5})}>startBattle</button>
			<button onClick={() => console.log(dialogueList[currentDialogueID])}>playerHealth</button>
		</div>
	);
}

export default App;