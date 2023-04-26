import {useState, useRef, useEffect} from 'react';
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
			},
			price: 15
		},
		{
			id: 2,
			text: 'Key',
			overworldOnly: true,
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
	const justLeveledUp = useRef(false);
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
		//console.log('enoughMoney.current:', enoughMoney.current);
	}

	const justUsedOverworldItem = useRef(false);

	function requestUseOverworldItem(itemName) {
		const foundItemIndex = playerItemsRef.current.findIndex(item => item.text === itemName);
		if(foundItemIndex > -1) {
			playerItemsRef.current = playerItemsRef.current.slice(foundItemIndex, foundItemIndex + 1);
			justUsedOverworldItem.current = true;
			//console.log(justUsedOverworldItem.current);
		}
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
						jumpTo: item.overworldOnly ? 12 : 6,
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
			doAction: () => winBattle(),
		},
		{
			id: 9,
			text: `You won the battle! You got ${gainedExperience.current} experience points and ${gainedMoney.current} gold! ${justLeveledUp.current ? `You leveled up to level ${currentLevel.current}!` : ''}`,
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
			text: "That item can only be used in the overworld.",
			jumpTo: 3
		},
		{
			id: 13,
			text: "Hello traveler.",
		},
		{
			id: 14,
			text: "Do you like apples or oranges?",
			choices: [
				{
					number: 1,
					text: "I declare that oranges are amazing!",
					doAction: () => {fruitChoice.current = "oranges"},
					jumpTo: 15,
				},
				{
					number: 2,
					text: "APPLES!",
					doAction: () => {fruitChoice.current = "apples"},
					jumpTo: 16,
				},
				{
					number: 3,
					text: "None of the above.",
					jumpTo: 17
				}
			]
		},
		{
			id: 15,
			text: "I'll get you some orange juice then.",
			jumpTo: 18
		},
		{
			id: 16,
			text: "I'll get you some apple juice then.",
			jumpTo: 18
		},
		{
			id: 17,
			text: "Fair enough."
		},
		{
			id: 18,
			text: "So what brings you here?"
		},
		{
			id: 19,
			text: `I assume it's for more than just looking for ${fruitChoice.current}.`
		},
		{
			id: 20,
			text: "Would you like to buy something?",
			choices: [
				{
					number: 1,
					text: "That's all, thank you.",
					jumpTo: 22,
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
					jumpTo: 21,
				},
			]
		},
		{
			id: 21,
			text: enoughMoney.current ? `You purchased a ${lastPurchasedItem.current}.` : "You don't have enough gold for that item.",
			jumpTo: 20,
		},
		{
			id: 22,
			text: 'Have a nice day then!'
		},
		{
			id: 23,
			text: "You found 10 gold in a treasure chest! I'm totally sure that no one will miss it if you take it.",
			doAction: () => {moneyRef.current += 10; setMoney(moneyRef.current);},
		},
		{
			id: 24,
			text: "You continue on your journey.",
		},
		{
			id: 25,
			text: "You find a locked door.",
			doAction: () => requestUseOverworldItem('Key'),
		},
		{
			id: 26,
			text: justUsedOverworldItem.current ? "You used a key to unlock it." : "You don't have a key, so you decide to continue exploring.",
			jumpTo: justUsedOverworldItem.current ? 28 : 27
		},
		{
			id: 27,
			text: "Where could that key be?",
			jumpTo: 20
		},
		{
			id: 28,
			text: "You open the door."
		}
	];

	const [currentDialogueID, setCurrentDialogueID] = useState(24);

	function startBattle(enemy) {
		enemyName.current = enemy.name;
		enemyHealth.current = enemy.health;
		enemyPower.current = enemy.attack;
		gainedExperience.current = enemy.experience;
		gainedMoney.current = enemy.money;
		justLeveledUp.current = false;
		
		oldDialoguePlace.current = currentDialogueID;
		//console.log(oldDialoguePlace.current);
		setCurrentDialogueID(0);
	}

	function enemyAttack() {
		playerDamage.current = Math.floor(enemyPower.current / playerDefense.current);
		playerHealthRef.current -= playerDamage.current;
		setPlayerHealth(playerHealthRef.current);
	}

	function decrementBoostDuration() {
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
	}

	function getTurnResult(decision) {
		const selection = decision.selection;
		//console.log(`${decision.category} ${selection} + enemy attack`);
		
		if(decision.category === 'magic') {
			const chosenMove = playerMagicMoves.find(move => move.id === selection);

			if(playerMagicRef.current >= chosenMove.effects.magicCost) {
				enemyDamage.current = chosenMove.effects.enemyDamage * playerPower.current;
				playerMagicRef.current -= chosenMove.effects.magicCost;
				decrementBoostDuration();
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

			if(chosenItem.overworldOnly) {
				return;
			}

			decrementBoostDuration();

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
			decrementBoostDuration();
			enemyAttack();
		}
		setPlayerMagic(playerMagicRef.current);
		setPlayerHealth(playerHealthRef.current);
	}

	function winBattle() {
		experienceRef.current = gainedExperience.current;
		moneyRef.current = gainedMoney.current;
		justLeveledUp.current = true;

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

		justUsedOverworldItem.current = false;

		// Run method only if the object contains it, from dfsq on StackOverflow: https://stackoverflow.com/questions/14961891/how-to-check-if-an-object-has-a-function-dojo
		if(typeof currentDialogue.doAction === 'function') {
			currentDialogue.doAction();
		}

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
	const [modalTypeSelection, setModalTypeSelection] = useState('');

	const [soundEffectsVolume, setSoundEffectsVolume] = useState(100);
	const [soundEffectsMute, setSoundEffectsMute] = useState(false);
	const [musicVolume, setMusicVolume] = useState(100);
	const [musicMute, setMusicMute] = useState(false);

	const [currentSound, setCurrentSound] = useState('');
	const [currentMusic, setCurrentMusic] = useState('');

	const soundElementRef = useRef(null);
	const musicElementRef = useRef(null);

	async function playSound(soundPath) {
		setCurrentSound(soundPath);
		try {
			await soundElementRef.current.play();
		}
		catch(error) {
			console.error(error);
		}
	}

	async function playMusic(musicPath) {
		setCurrentMusic(musicPath);
		try {
			await musicElementRef.current.play();
		}
		catch(error) {
			console.error(error);
		}
	}

	const [reduceMotion, setReduceMotion] = useState(true);
	const [darkMode, setDarkMode] = useState(true);

	function checkForReducedMotion() {
		if(window.matchMedia('(prefers-reduced-motion: no-preference)').matches === true) {
			setReduceMotion(false);
		}
		else {
			setReduceMotion(true);
		}
	}

	useEffect(() => {
		// Event listener modified from example here: https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/
		window.matchMedia('(prefers-reduced-motion: no-preference)').addEventListener('change', checkForReducedMotion);
	}, []);

	function ModalContent({modalType}) {
		if(modalType === 'options') {
			return (
				<div className='box'>
					<label>
						<p>Sound Effects Volume (Percent)</p>
						<input value={soundEffectsVolume} onChange={(event) => setSoundEffectsVolume(event.target.value)} type='number' min="0" max="100" />
					</label>
					<label className='checkbox'>
						<input checked={soundEffectsMute} onChange={(event) => setSoundEffectsMute(event.target.checked)} type='checkbox' />
						Mute Sound Effects
					</label>
					<label>
						<p>Music Volume (Percent)</p>
						<input value={musicVolume} onChange={(event) => setMusicVolume(event.target.value)} type='number' min="0" max="100" />
					</label>
					<label className='checkbox'>
						<input checked={musicMute} onChange={(event) => setMusicMute(event.target.checked)} type='checkbox' />
						Mute Music
					</label>
					<label className='checkbox'>
						<input checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} type='checkbox' />
						Prefer Reduced Motion
					</label>
					<label className='checkbox'>
						<input checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} type='checkbox' />
						Dark Mode
					</label>
				</div>
			);
		}
		if(modalType === 'inventory') {
			return (
				<div className='box'>
					<ul>
					{playerItems.map(item => (
						<li key={item.id}>
							{item.text} {item.overworldOnly ? '(Overworld Only)' : ''}
							<ul>
								{item.playerEffects?.health ? (<li>+ {item.playerEffects.health} Health</li>) : ''}

								{item.playerEffects?.magic ? (<li>+ {item.playerEffects.magic} Magic</li>) : ''}

								{item.playerEffects?.powerAmount && item.playerEffects?.powerTurns ? (<li>{item.playerEffects.powerAmount}x Power Boost for {item.playerEffects.powerTurns} Turns</li>) : ''}
								
								{item.playerEffects?.defenseAmount && item.playerEffects?.defenseTurns ? (<li>{item.playerEffects.defenseAmount}x Defense Boost for {item.playerEffects.defenseTurns} Turns</li>) : ''}
							</ul>
						</li>
					))}
					</ul>
				</div>
			);
		}
		else {
			return (
				<div className='box'></div>
			);
		}
	}

	const [currentSprite, setCurrentSprite] = useState('src/assets/images/sprites/alienYellow.png');
	const [currentSpriteAlt, setCurrentSpriteAlt] = useState('');
	const [currentAnimation, setCurrentAnimation] = useState('src/assets/images/animations/explosion_1.png');
	const [background, setBackground] = useState('');

	function playAnimation(animationPath, soundPath, duration) {
		setCurrentAnimation(animationPath);
		playSound(soundPath);
		setTimeout(() => {
			setCurrentAnimation('');
		}, duration * 1000);
	}

	const choiceButtons = choices.map(choice => (
		<button onClick={dialogueChoiceButton} data-number={choice.number} data-jumpto={choice.jumpTo} key={choice.text} className='button choice'>{choice.text}</button>
	));
	
	return (
		<div id='game' className={darkMode ? 'dark' : ''} style={{background: `url("${background}")`}}>
			<button onClick={() => {setModalTypeSelection('options'); setModalVisible(true);}} id='options-button' className='button'>Options</button>
			<button onClick={() => {setModalTypeSelection('inventory'); setModalVisible(true);}} id='inventory-button' className='button'>Inventory</button>
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
					<ModalContent modalType={modalTypeSelection} />
				</div>
				<button onClick={() => {setModalVisible(false)}} className='modal-close is-large' aria-label='Close'></button>
			</div>
			{/* <button className='button' onClick={() => startBattle({name: 'Slime', health: 10, attack: 2, experience: 10, money: 5})}>startBattle</button>
			<button className='button' onClick={() => {
				console.log('soundEffectsMute:', soundEffectsMute);
			}}>soundEffectsMute</button> */}
			<img src={currentSprite} alt={currentSpriteAlt} id='sprite' />
			<img src={currentAnimation} alt='' id='sprite-animation' />
			<audio ref={soundElementRef} src={currentSound} volume={soundEffectsMute ? 0 : soundEffectsVolume}>
				Your browser does not support the audio element.
			</audio>
			<audio ref={musicElementRef} src={currentMusic} volume={musicMute ? 0 : musicVolume} loop>
				Your browser does not support the audio element.
			</audio>
		</div>
	);
}

export default App;