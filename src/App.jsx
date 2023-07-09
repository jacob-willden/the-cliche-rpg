/*
    @source: https://github.com/jacob-willden/the-cliche-rpg/
	@source: https://github.com/geoffrich/geoffrich.net

    @licstart  The following is the entire license notice this file.

    This file is part of The Cliché RPG.
    
    The Cliché RPG Copyright (C) 2023 Jacob Willden
    (Released under the GNU General Public License (GNU GPL) Version 3.0 or later)

    Code Snippet from Geoff Rich Website Copyright (C) 2021 Geoff Rich
    (Released under the MIT License (Expat License))

    Some of the code below is provided by users from StackOverflow, and 
	is explicitly stated as so. Such code is released under either the 
	Creative Commons Attribution Share-Alike 3.0 or 4.0. I specify Creative 
	Commons as my proxy to make the contributions from StackOverflow 
	compatible with future versions of the GPL. One section of code below
	is from Geoff Rich's Website, is released under the MIT (Expat) License, 
	and is explicitly stated as so (the article with the code was published
	on March 1, 2021).

    Afformentioned source code derived and modified by Jacob Willden
    Start Date of Derivation/Modification: April 8, 2023
    Most Recent Date of Derivation/Modification: April 27, 2023

    The Cliché RPG is free software: you can redistribute it and/or 
	modify it under the terms of the GNU General Public License (GNU 
	GPL) as published by the Free Software Foundation, either version 
	3 of the License, or (at your option) any later version. The 
	project is distributed WITHOUT ANY WARRANTY; without even the 
	implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
	PURPOSE. See the GNU GPL for more details.

    As additional permission under GNU GPL version 3 section 7, you
    may distribute non-source (e.g., minimized or compacted) forms of
    the code without the copy of the GNU GPL normally required by
    section 4, provided you include this license notice and a URL
    through which recipients can access the Corresponding Source.

    You should have recieved a copy of the GNU General Public License
    along with this project. Otherwise, see: https://www.gnu.org/licenses/

    @licend  The above is the entire license notice for this file.
*/

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
			},
			animation: {
				visual: '/assets/images/animations/explosion_2.png',
				audio: '/assets/sounds/effects/Gunfire.ogg',
				duration: 2
			}
		}
	];

	const [playerItems, setPlayerItems] = useState([
		{
			id: Symbol(),
			text: 'Potion',
			playerEffects: {
				health: 10,
				magic: 5
			},
			price: 10,
			icon: '/assets/images/icons/health_potion.png',
			sound: '/assets/sounds/effects/Gunfire.ogg'
		},
	]);
	const playerItemsRef = useRef();
	playerItemsRef.current = playerItems;

	const usedItemsInBattle = useRef([]);

	const playerPower = useRef(1);
	const playerDefense = useRef(1);
	const playerPowerBoost = useRef(1);
	const playerDefenseBoost = useRef(1);
	const playerPowerBoostTurnsLeft = useRef(0);
	const playerDefenseBoostTurnsLeft = useRef(0);

	const [experience, setExperience] = useState(0);
	const experienceRef = useRef();
	experienceRef.current = experience;
	const [money, setMoney] = useState(100);
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
	const tooManyItems = useRef(false);

	function purchaseItem(item) {
		if(playerItemsRef.current.length < 5) {
			if(item.price <= moneyRef.current) {
				lastPurchasedItem.current = item.text;
				enoughMoney.current = true;
				moneyRef.current -= item.price;
	
				playerItemsRef.current = [
					...playerItemsRef.current,
					{
						id: Symbol(),
						...item
					}
				];
	
				setMoney(moneyRef.current);
				setPlayerItems(playerItemsRef.current);
			}
			else {
				enoughMoney.current = false;
			}
			tooManyItems.current = false;
			//console.log('enoughMoney.current:', enoughMoney.current);
		}
		else {
			tooManyItems.current = true;
		}
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
	const alreadyFoughtSlime = useRef(false);

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
						doAction: () => getTurnResult({category: 'magic', selection: move.id}),
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
						doAction: () => getTurnResult({category: 'item', selection: item.id}),
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
					text: "Yes, restart the battle.",
					doAction: () => resetBattle(),
					jumpTo: 0
				},
				{
					number: 2,
					text: "No, restart the game.",
					doAction: () => window.location = 'https://the-cliche-rpg.vercel.app/',
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
			text: 'As you begin your journey, you find a merchant. "Hello traveler."',
		},
		{
			id: 14,
			text: '"Do you like apples or oranges better?"',
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
					jumpTo: 15,
				},
				{
					number: 3,
					text: "None of the above.",
					jumpTo: 15
				}
			]
		},
		{
			id: 15,
			text: `"You like ${fruitChoice.current}. Good to know. So what brings you here? I do have some items to sell."`
		},
		{
			id: 16,
			text: '"Would you like to buy something?"',
			choices: [
				{
					number: 1,
					text: "That's all, thank you.",
					jumpTo: 18,
				},
				{
					number: 2,
					text: "Potion - 10 Gold",
					doAction: () => purchaseItem({
						text: 'Potion',
						playerEffects: {
							health: 10,
							magic: 5
						},
						price: 10,
						icon: '/assets/images/icons/health_potion.png',
						sound: '/assets/sounds/effects/Gunfire.ogg'
					}),
					jumpTo: 17,
				},
				{
					number: 3,
					text: 'Tonic Booster - 15 Gold',
					doAction: () => purchaseItem({
						text: 'Tonic Booster',
						playerEffects: {
							powerAmount: 2,
							powerTurns: 3,
							defenseAmount: 2,
							defenseTurns: 3
						},
						price: 15,
						icon: '/assets/images/icons/tonic.png',
						sound: '/assets/sounds/effects/Gunfire.ogg'
					}),
					jumpTo: 17,
				},
				{
					number: 4,
					text: "Key - 20 Gold",
					doAction: () => purchaseItem({
						text: 'Key',
						overworldOnly: true,
						price: 20,
						icon: '/assets/images/icons/key.png'
					}),
					jumpTo: 17,
				}
			]
		},
		{
			id: 17,
			text: tooManyItems.current ? "You can only carry up to five items at a time." : enoughMoney.current ? `You purchased a ${lastPurchasedItem.current}.` : "You don't have enough gold for that item.",
			jumpTo: 16,
		},
		{
			id: 18,
			text: alreadyFoughtSlime.current ? "Have a good day then! Those monsters are tough, aren't they?" : '"Have a nice day then! Be sure to look out for monsters. They\'re not the nice kind that teach you the alphabet or numbers."',
			jumpTo: alreadyFoughtSlime.current ? 22 : 19
		},
		{
			id: 19,
			text: "You leave the village and journey into the wilderness.",
			doAction: () => setBackground('/assets/images/backgrounds/grassland_background.jpg')
		},
		{
			id: 20,
			text: alreadyFoughtSlime.current ? "You pass the treasure chest that you ransacked, I mean discovered." : "You find 10 gold in a treasure chest! I'm totally sure that no one will miss it if you take it.",
			doAction: () => {
				if(!alreadyFoughtSlime.current)
				{
					moneyRef.current += 10;
					setMoney(moneyRef.current);
				}
			},
		},
		{
			id: 21,
			text: "You continue on your journey. Suddenly, a monster emerges from the bushes!",
			doAction: () => startBattle({name: 'Slime', health: 10, attack: 1, experience: 10, money: 5, sprite: '/assets/images/sprites/slime.png', spriteAlt: 'Ghost enemy'}),
			battle: true
		},
		{
			id: 22,
			text: "You continue on your journey.",
			doAction: () => {
				alreadyFoughtSlime.current = true;
				if(background !== '/assets/images/backgrounds/grassland_background.jpg') setBackground('/assets/images/backgrounds/grassland_background.jpg');
			}
		},
		{
			id: 23,
			text: "You find a locked door.",
			doAction: () => requestUseOverworldItem('Key'),
		},
		{
			id: 24,
			text: justUsedOverworldItem.current ? "You used a key to unlock it." : "You don't have a key, so you decide to continue exploring.",
			jumpTo: justUsedOverworldItem.current ? 26 : 25
		},
		{
			id: 25,
			text: "Where could that key be? Oh wait! That merchant was selling keys. You decide to go back.",
			doAction: () => setBackground('/assets/images/backgrounds/village_background.jpg'),
			jumpTo: 16
		},
		{
			id: 26,
			text: "You open the door. Inside, you find a cave, which seems an odd place for a door. Nevertheless, there is a passage ahead that splits into two directions.",
			doAction: () => {
				playerItemsRef.current.splice(playerItemsRef.current.findIndex(item => item.text === 'Key'), 1);
				setPlayerItems(playerItemsRef.current);
				setBackground('/assets/images/backgrounds/cave_background.jpg');
			}
		},
		{
			id: 27,
			text: 'Which direction should you go?',
			choices: [
				{
					number: 1,
					text: "Left.",
					jumpTo: 28,
				},
				{
					number: 2,
					text: "Right.",
					doAction: () => {fruitChoice.current = "apples"},
					jumpTo: 29,
				},
			]
		},
		{
			id: 28,
			text: 'As you head left, you wonder why the merchant was able to sell you a key that unlocked this place. Is that even legal?',
			jumpTo: 30
		},
		{
			id: 29,
			text: `As you head right, you wonder how long it will take you navigate this place. Maybe you should have brought some ${fruitChoice.current} with you.`
		},
		{
			id: 30,
			text: 'From around a corner, a monster springs on you!',
			doAction: () => startBattle({name: 'Ghost', health: 20, attack: 2, experience: 30, money: 25, sprite: '/assets/images/sprites/ghost.png', spriteAlt: 'Ghost enemy'}),
			battle: true
		},
		{
			id: 31,
			text: 'You continue to walk through the corridor.'
		},
		{
			id: 32,
			text: 'You find a sign ahead of you that reads: "Thank you for playing this game demo! Click, tap, or activate the Next button again to go to the Github repository." I have no idea what that means.',
			doAction: () => window.location = 'https://github.com/jacob-willden/the-cliche-rpg'
		},
		{
			id: 33,
			text: "Hmm."
		}
	];

	const [currentDialogueID, setCurrentDialogueID] = useState(13);

	function startBattle(enemy) {
		enemyName.current = enemy.name;
		enemyHealth.current = enemy.health;
		enemyPower.current = enemy.attack;
		gainedExperience.current = enemy.experience;
		gainedMoney.current = enemy.money;
		justLeveledUp.current = false;

		setCurrentSprite(enemy.sprite);
		setCurrentSpriteAlt(enemy.spriteAlt);
		
		oldDialoguePlace.current = currentDialogueID + 1;
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

			if(chosenMove.animation?.visual && chosenMove.animation.audio && chosenMove.animation.duration) {
				playAnimation(chosenMove.animation.visual, chosenMove.animation.audio, chosenMove.animation.duration);
			}
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

			usedItemsInBattle.current = [
				...usedItemsInBattle.current,
				chosenItem
			];
			playerItemsRef.current = playerItemsRef.current.filter(item => item.id !== selection); // Remove item from inventory
			setPlayerItems(playerItemsRef.current);

			enemyAttack();

			if(chosenItem.sound) {
				playSound(chosenItem.sound);
			}
		}
		else { // Melee
			enemyDamage.current = playerPower.current;
			enemyHealth.current -= enemyDamage.current;
			decrementBoostDuration();
			enemyAttack();
			playAnimation('/assets/images/animations/explosion_1.png', '/assets/sounds/effects/Gunfire.ogg', 2);
		}
		setPlayerMagic(playerMagicRef.current);
		setPlayerHealth(playerHealthRef.current);
	}

	function winBattle() {
		experienceRef.current = gainedExperience.current;
		moneyRef.current = gainedMoney.current;
		justLeveledUp.current = true;
		setCurrentSprite('');
		setCurrentSpriteAlt('');

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

	function resetBattle() {
		playerHealthRef.current = maxPlayerHealthRef.current;
		playerMagicRef.current = maxPlayerMagicRef.current;
		setPlayerHealth(playerHealthRef.current);
		setPlayerMagic(playerMagicRef.current);

		playerPowerBoost.current = 1;
		playerPowerBoostTurnsLeft.current = 0;
		playerDefenseBoost.current = 1;
		playerDefenseBoostTurnsLeft.current = 0;

		playerItemsRef.current = [
			...playerItemsRef.current,
			...usedItemsInBattle.current
		];
		usedItemsInBattle.current = [];
	}

	const [showNextButton, setShowNextButton] = useState(true);

	function nextButton() {
		const currentDialogue = dialogueList[currentDialogueID];

		justUsedOverworldItem.current = false;

		// Run method only if the object contains it, from dfsq on StackOverflow: https://stackoverflow.com/questions/14961891/how-to-check-if-an-object-has-a-function-dojo
		if(typeof currentDialogue.doAction === 'function') {
			currentDialogue.doAction();
		}

		if(currentDialogue.battle) {
			return;
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

	const modalElement = useRef(null);
	const [modalClass, setModalClass] = useState('');
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

	const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
	const prefersReducedMotionRef = useRef(true);
	const [reduceMotion, setReduceMotion] = useState(true);
	const [darkMode, setDarkMode] = useState(true);

	function checkForReducedMotion() {
		if(window.matchMedia('(prefers-reduced-motion: no-preference)').matches === true && !prefersReducedMotionRef.current) {
			setReduceMotion(false);
		}
		else {
			//console.log('prefersReducedMotionRef:', prefersReducedMotionRef.current)
			setReduceMotion(true);
		}
	}

	useEffect(() => {
		// Event listener modified from an example by Geoff Rich, under the Expat (MIT) License (see full attribution below): https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/
		/* 
			MIT License (Expat License)

			Copyright (c) 2019 andy-bell.design and other contributors

			Permission is hereby granted, free of charge, to any person obtaining a copy
			of this software and associated documentation files (the "Software"), to deal
			in the Software without restriction, including without limitation the rights
			to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
			copies of the Software, and to permit persons to whom the Software is
			furnished to do so, subject to the following conditions:

			The above copyright notice and this permission notice shall be included in all
			copies or substantial portions of the Software.

			THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
			IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
			FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
			AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
			LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
			OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
			SOFTWARE.
		*/
		window.matchMedia('(prefers-reduced-motion: no-preference)').addEventListener('change', checkForReducedMotion);
		checkForReducedMotion();
	}, []);

	function modalContent(modalType) {
		if(modalType === 'options') {
			return (
				<div className='box'>
					<div>
						<label htmlFor='sound-volume'>Sound Effects Volume (Percent)</label>
						<input id='sound-volume' value={soundEffectsVolume} onChange={(event) => setSoundEffectsVolume(event.target.value)} type='number' min="0" max="100" />
					</div>
					<div className='checkbox'>
						<input id='mute-sound' checked={soundEffectsMute} onChange={(event) => setSoundEffectsMute(event.target.checked)} type='checkbox' />
						<label htmlFor='mute-sound'>Mute Sound Effects</label>
					</div>
					<div>
						<label htmlFor='music-volume'>Music Volume (Percent)</label>
						<input id='music-volume' value={musicVolume} onChange={(event) => setMusicVolume(event.target.value)} type='number' min="0" max="100" />
					</div>
					<div className='checkbox'>
						<input id='mute-music' checked={musicMute} onChange={(event) => setMusicMute(event.target.checked)} type='checkbox' />
						<label htmlFor='mute-music'>Mute Music</label>
					</div>
					<div className='checkbox'>
						<input id='reduce-motion' checked={prefersReducedMotion} onChange={(event) => {
							prefersReducedMotionRef.current = event.target.checked;
							setPrefersReducedMotion(prefersReducedMotionRef.current);
							checkForReducedMotion();
						}} type='checkbox' />
						<label htmlFor='reduce-motion'>Prefer Reduced Motion</label>
					</div>
					<div className='checkbox'>
						<input id='dark-mode' checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} type='checkbox' />
						<label htmlFor='dark-mode'>Dark Mode</label>
					</div>
					<a href='https://github.com/jacob-willden/the-cliche-rpg'>Game Credits and Source Code</a>
				</div>
			);
		}
		if(modalType === 'inventory') {
			return (
				<div className='box'>
					<ul>
					{playerItems.map(item => (
						<li key={item.id.toString()}>
							{item.text} {item.overworldOnly ? '(Overworld Only)' : ''} <img src={item.icon} alt='' className='item-icon' />
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

	const [currentSprite, setCurrentSprite] = useState('');
	const [currentSpriteAlt, setCurrentSpriteAlt] = useState('');
	const [currentAnimation, setCurrentAnimation] = useState('');
	const [animationVisible, setAnimationVisible] = useState(false);
	const [background, setBackground] = useState('/assets/images/backgrounds/village_background.jpg');

	function playAnimation(animationPath, soundPath, duration) {
		playSound(soundPath);

		if(window.matchMedia('(prefers-reduced-motion: no-preference)').matches === true && !reduceMotion) {
			setCurrentAnimation(animationPath);
			setAnimationVisible(true);
			setTimeout(() => {
				setAnimationVisible(false);
			}, duration * 1000);
		}
		else {
			setAnimationVisible(false);
		}
	}

	function openModal() {
		setModalClass('is-active');
		modalElement.current.showModal();
	}

	function closeModal() {
		setModalClass('');
		modalElement.current.close();
	}

	const choiceButtons = choices.map(choice => (
		<button onClick={dialogueChoiceButton} data-number={choice.number} data-jumpto={choice.jumpTo} key={choice.number} className='button choice'>{choice.text}</button>
	));
	
	return (
		<div id='game' className={darkMode ? 'dark' : ''}>
			<img id='background' src={background} alt='' />
			<button onClick={() => {setModalTypeSelection('options'); openModal();}} id='options-button' className='button'>Options</button>
			<button onClick={() => {setModalTypeSelection('inventory'); openModal();}} id='inventory-button' className='button'>Inventory</button>
			<div id='choices-view'>
				<div id='choices-list'>
					{choiceButtons}
				</div>
			</div>
			<div id='reserves'>
				<div className='card'>
					<div>
						Health: <span id='health'>{playerHealth}</span> / <span id='max-health'>{maxPlayerHealth}</span>
					</div>
					<div>
						Magic: <span id='magic'>{playerMagic}</span> / <span id='max-magic'>{maxPlayerMagic}</span>
					</div>
					<div>
						Experience: <span id='experience'>{experience}</span>
					</div>
					<div>
						Gold: <span id='money'>{money}</span>
					</div>
				</div>
			</div>
			<div id='primary-textbox' className='card'>
				<p id='primary-textbox-text'>{dialogueList[currentDialogueID].text}</p>
				<button onClick={nextButton} className={`button next-button ${showNextButton ? '' : 'hidden-next-button'}`}>Next</button>
			</div>
			<dialog ref={modalElement} className={`modal ${modalClass}`}>
				<div className='modal-background'></div>
				<div className='modal-content'>
					<button onClick={closeModal} className='modal-close is-large' aria-label='Close'></button>
					{modalContent(modalTypeSelection)}
				</div>
			</dialog>
			<img src={currentSprite} alt={currentSpriteAlt} id='sprite' />
			<img src={currentAnimation} alt='' id='sprite-animation' style={{opacity: animationVisible ? 1 : 0}} />
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