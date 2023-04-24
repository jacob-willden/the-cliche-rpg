import {useState, useRef} from 'react';
import './bulma.min.css';
import './App.css';

function App() {
	const [playerHealth, setPlayerHealth] = useState(100);
	const playerHealthRef = useRef();
	playerHealthRef.current = playerHealth; // Set as both useState and useRef, from Brandon on StackOverflow: https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
	
	const [playerMagic, setPlayerMagic] = useState(2);
	const playerMagicRef = useRef();
	playerMagicRef.current = playerMagic;

	const [maxPlayerHealth, setMaxPlayerHealth] = useState(100);
	const maxPlayerHealthRef = useRef();
	maxPlayerHealthRef.current = maxPlayerHealth;

	const [maxPlayerMagic, setMaxPlayerMagic] = useState(100);
	const maxPlayerMagicRef = useRef();
	maxPlayerMagicRef.current = maxPlayerMagic;

	const playerMagicMoves = [
		{
			id: 0,
			text: "Magic Attack",
			effects: {
				enemyDamage: 5,
				magicCost: 2
			}
		}
	];

	const [playerItems, setPlayerItems] = useState([
		{
			id: 0,
			text: 'Health Potion',
			playerEffects: {
				health: 10,
				magic: 5
			},
			price: 10
		},
		{
			id: 1,
			text: 'Tonic Booster',
			playerEffects: {
				powerAmount: 2,
				powerTurns: 3,
				defenseAmount: 2,
				defenseTurns: 3
			}
		}
	]);
	const playerItemsRef = useRef();
	playerItemsRef.current = playerItems;

	const playerPower = useRef(1);
	const playerDefense = useRef(1);
	const playerPowerBoost = useRef(1);
	const playerDefenseBoost = useRef(1);
	const playerPowerBoostTurnsLeft = useRef(0);
	const playerDefenseBoostTurnsLeft = useRef(0);

	const [experience, setExperience] = useState(0);
	const experienceRef = useRef();
	experienceRef.current = experience;
	const [money, setMoney] = useState(20);
	const moneyRef = useRef();
	moneyRef.current = money;

	const enoughMoney = useRef(true);

	const currentLevel = useRef(1);
	const levels = [
		{
			number: 2,
			minimumExp: 10,
			increasedMaxHealth: 20,
			increasedMaxMagic: 10
		},
		{
			number: 3,
			minimumExp: 30,
			increasedMaxHealth: 15,
			increasedMaxMagic: 15
		},
		{
			number: 4,
			minimumExp: 70,
			increasedMaxHealth: 10,
			increasedMaxMagic: 20
		},
		{
			number: 5,
			minimumExp: 150,
			increasedMaxHealth: 20,
			increasedMaxMagic: 20
		}
	];

	const oldDialoguePlace = useRef(0);

	const enemyName = useRef('');
	const enemyHealth = useRef(1);
	const enemyPower = useRef(1);
	
	const playerDamage = useRef(0);
	const enemyDamage = useRef(0);

	const magicChoice = useRef('');
	const itemChoice = useRef('');
	const itemResult = useRef('');
	const gainedExperience = useRef(0);
	const gainedMoney = useRef(0);

	const lastPurchasedItem = useRef('');

	function purchaseItem(item) {
		if(item.price <= moneyRef.current) {
			enoughMoney.current = true;
			moneyRef.current -= item.price;

			playerItemsRef.current = [
				...playerItemsRef.current,
				{
					id: playerItemsRef.current.length,
					...item
				}
			];

			setMoney(moneyRef.current);
			setPlayerItems(playerItemsRef.current);
		}
		else {
			enoughMoney.current = false;
		}
		console.log('enoughMoney.current:', enoughMoney.current);
	}

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
					doAction: () => getTurnResult({category: 'melee'}),
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
				...playerMagicMoves.map((move, index) => {
					return {
						number: index + 2,
						doAction: () => getTurnResult({category: 'magic', selection: index}),
						jumpTo: playerMagicRef.current >= move.effects.magicCost ? 5 : 11,
						...move
					}
				}),
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
				...playerItems.map((item, index) => {
					return {
						number: index + 2,
						doAction: () => getTurnResult({category: 'item', selection: index}),
						jumpTo: 6,
						...item
					}
				}),
			]
		},
		{
			id: 4,
			text: `You used your melee attack, the enemy took ${enemyDamage.current} damage.`,
			jumpTo: enemyHealth.current > 0 ? 7 : 8
		},
		{
			id: 5,
			text: `You used the ${magicChoice.current} move, the enemy took ${enemyDamage.current} damage.`,
			jumpTo: enemyHealth.current > 0 ? 7 : 8
		},
		{
			id: 6,
			text: `You used the ${itemChoice.current} item. ${itemResult.current}`,
			jumpTo: enemyHealth.current > 0 ? 7 : 8
		},
		{
			id: 7,
			text: `The ${enemyName.current} attacks, you take ${playerDamage.current} damage.`,
			jumpTo: playerHealthRef.current > 0 ? 1 : 10
		},
		{
			id: 8,
			text: `The ${enemyName.current} fell!`,
		},
		{
			id: 9,
			text: `You won the battle! You got ${gainedExperience.current} experience points and ${gainedMoney.current} gold!`,
			doAction: () => winBattle(),
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
					jumpTo: 12
				},
			]
		},
		{
			id: 11,
			text: "You don't have enough magic points to make that move.",
			jumpTo: 2
		},
		{
			id: 12,
			text: "Hello traveler.",
		},
		{
			id: 13,
			text: "Do you like apples or oranges?",
			choices: [
				{
					number: 1,
					text: "I declare that oranges are amazing!",
					doAction: () => {fruitChoice.current = "oranges"},
					jumpTo: 14,
				},
				{
					number: 2,
					text: "APPLES!",
					doAction: () => {fruitChoice.current = "apples"},
					jumpTo: 15,
				},
				{
					number: 3,
					text: "None of the above.",
					jumpTo: 16
				}
			]
		},
		{
			id: 14,
			text: "I'll get you some orange juice then.",
			jumpTo: 17
		},
		{
			id: 15,
			text: "I'll get you some apple juice then.",
			jumpTo: 17
		},
		{
			id: 16,
			text: "Fair enough."
		},
		{
			id: 17,
			text: "So what brings you here?"
		},
		{
			id: 18,
			text: `I assume it's for more than just looking for ${fruitChoice.current}.`
		},
		{
			id: 19,
			text: "Would you like to buy something?",
			choices: [
				{
					number: 1,
					text: "That's all, thank you.",
					jumpTo: 21,
				},
				{
					number: 2,
					text: "Health Potion - 10 Gold",
					doAction: () => purchaseItem({
						text: 'Health Potion',
						playerEffects: {
							health: 10,
							magic: 5
						},
						price: 10
					}),
					jumpTo: 20,
				},
			]
		},
		{
			id: 20,
			text: enoughMoney.current ? `You purchased a ${lastPurchasedItem.current}.` : "You don't have enough gold for that item.",
			jumpTo: 19,
		},
		{
			id: 21,
			text: 'Have a nice day then!'
		},
	];

	const [currentDialogueID, setCurrentDialogueID] = useState(18);

	function startBattle(enemy) {
		enemyName.current = enemy.name;
		enemyHealth.current = enemy.health;
		enemyPower.current = enemy.attack;
		gainedExperience.current = enemy.experience;
		gainedMoney.current = enemy.money;
		
		oldDialoguePlace.current = currentDialogueID;
		//console.log(oldDialoguePlace.current);
		setCurrentDialogueID(0);
	}

	function enemyAttack() {
		playerDamage.current = Math.floor(enemyPower.current / playerDefense.current);
		playerHealthRef.current -= playerDamage.current;
		setPlayerHealth(playerHealthRef.current);
	}

	function getTurnResult(decision) {
		const selection = decision.selection;
		//console.log(`${decision.category} ${selection} + enemy attack`);

		if(playerPowerBoostTurnsLeft.current > 0) {
			playerPowerBoostTurnsLeft.current -= 1;
		}
		else if(playerPowerBoost.current > 1) {
			playerPower.current = playerPower.current / playerPowerBoost.current;
			playerPowerBoost.current = 1;
		}

		if(playerDefenseBoostTurnsLeft.current > 0) {
			playerDefenseBoostTurnsLeft.current -= 1;
		}
		else if(playerDefenseBoost.current > 1) {
			playerDefense.current = playerDefense.current / playerDefenseBoost.current;
			playerDefenseBoost.current = 1;
		}
		
		if(decision.category === 'magic') {
			const chosenMove = playerMagicMoves.find(move => move.id === selection);

			if(playerMagicRef.current >= chosenMove.effects.magicCost) {
				enemyDamage.current = chosenMove.effects.enemyDamage * playerPower.current;
				playerMagicRef.current -= chosenMove.effects.magicCost;
				enemyAttack();
			}
			else {
				enemyDamage.current = 0;
			}

			if(playerMagicRef.current < 0) {
				playerMagicRef.current = 0;
			}

			magicChoice.current = chosenMove.text;
			enemyHealth.current -= enemyDamage.current;
		}
		else if(decision.category === 'item') {
			itemResult.current = '';

			const chosenItem = playerItemsRef.current.find(item => item.id === selection);
			itemChoice.current = chosenItem.text;

			const playerEffects = chosenItem.playerEffects;

			if(playerEffects.powerAmount && playerEffects.powerTurns) {
				playerPowerBoost.current = playerEffects.powerAmount;
				playerPowerBoostTurnsLeft.current = playerEffects.powerTurns;
				playerPower.current = playerPower.current * playerEffects.powerAmount;
				itemResult.current += `You gained ${playerEffects.powerAmount}x attack power for ${playerEffects.powerTurns} turns. `;
			}

			if(playerEffects.defenseAmount && playerEffects.defenseTurns) {
				playerDefenseBoost.current = playerEffects.defenseAmount;
				playerDefenseBoostTurnsLeft.current = playerEffects.defenseTurns;
				playerDefense.current = playerDefense.current * playerEffects.defenseAmount;
				itemResult.current += `You gained ${playerEffects.defenseAmount}x defense power for ${playerEffects.defenseTurns} turns. `;
			}

			if(playerEffects.health && playerEffects.magic) {
				itemResult.current += `You gained ${playerEffects.health || ''}${playerEffects.health ? ' health' : ''}${playerEffects.health && playerEffects.magic ? ' and ' : ''}${playerEffects.magic || ''} ${playerEffects.magic ? ' magic' : ''} back.`;
			}

			playerHealthRef.current += playerEffects.health || 0;
			playerMagicRef.current += playerEffects.magic || 0;

			if(playerHealthRef.current > maxPlayerHealth) {
				playerHealthRef.current = maxPlayerHealth;
			}
			if(playerMagicRef.current > maxPlayerMagic) {
				playerMagicRef.current = maxPlayerMagic;
			}

			//console.log('playerHealthRef.current:', playerHealthRef.current);

			playerItemsRef.current = playerItemsRef.current.filter(item => item.id !== selection); // Remove item from inventory
			setPlayerItems(playerItemsRef.current);

			enemyAttack();
		}
		else { // Melee
			enemyDamage.current = playerPower.current;
			enemyHealth.current -= enemyDamage.current;
			enemyAttack();
		}
		setPlayerMagic(playerMagicRef.current);
		setPlayerHealth(playerHealthRef.current);
	}

	function winBattle() {
		experienceRef.current = gainedExperience.current;
		moneyRef.current = gainedMoney.current;

		for(let level of levels) {
			if(experienceRef.current >= level.minimumExp && currentLevel.current < level.number) {
				currentLevel.current = level.number;
				maxPlayerHealthRef.current += level.increasedMaxHealth || 0;
				maxPlayerMagicRef.current += level.increasedMaxMagic || 0;
				
				setMaxPlayerHealth(maxPlayerHealthRef.current);
				setMaxPlayerMagic(maxPlayerMagicRef.current);
				break;
			}
		}
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

		// Run method only if the object contains it, from dfsq on StackOverflow: https://stackoverflow.com/questions/14961891/how-to-check-if-an-object-has-a-function-dojo
		if(typeof currentDialogue.doAction === 'function') {
			currentDialogue.doAction();
		}

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
			<button className='button' onClick={() => startBattle({name: 'Slime', health: 10, attack: 2, experience: 10, money: 5})}>startBattle</button>
			<button className='button' onClick={() => {
				console.log('experienceRef.current:', experienceRef.current, 'currentLevel.current:', currentLevel.current, 'maxPlayerHealthRef.current:', maxPlayerHealthRef.current, 'maxPlayerMagicRef.current:', maxPlayerMagicRef.current);
			}}>stats</button>
		</div>
	);
}

export default App;