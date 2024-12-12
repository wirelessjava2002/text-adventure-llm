import React, { useEffect, useState } from 'react';
import Inventory from './Inventory';
import CharacterPortrait from './CharacterPortrait'; // Import the new component
import calculateLevel from './utils/levelUp'; // Adjust the path as necessary
import DiceComponent from './DiceComponent';

const Character = ({ characterStats, setCharacterStats }) => {
    const buildDate = process.env.REACT_APP_BUILD_DATE;
    const [diceRoll, setDiceRoll] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [currentPortraitIndex, setCurrentPortraitIndex] = useState(0); // State for current portrait index
    const totalPortraits = 14; // Total number of portraits


    // Function to reroll the ability stats
    const rollStats = () => {
        const newStats = {
            strength: Math.floor(Math.random() * 16) + 5,
            dexterity: Math.floor(Math.random() * 16) + 5,
            constitution: Math.floor(Math.random() * 16) + 5,
            intelligence: Math.floor(Math.random() * 16) + 5,
            wisdom: Math.floor(Math.random() * 16) + 5,
            charisma: Math.floor(Math.random() * 16) + 5,
        };

        // Use setCharacterStats passed from App.js to update the stats
        setCharacterStats((prevStats) => ({
            ...prevStats, // Spread the previous stats
            ...newStats, // Apply the new stats to update only the ability scores
        }));
    };

    const rollD20 = () => {
        setRolling(true);
        setDiceRoll(null);

        setTimeout(() => {
            const result = Math.floor(Math.random() * 20) + 1;
            setDiceRoll(result);
            setRolling(false);
        }, 1000);
    };

    // Function to change the portrait
    const changePortrait = (direction) => {
        setCurrentPortraitIndex((prevIndex) => {
            if (direction === 'left') {
                return (prevIndex - 1 + totalPortraits) % totalPortraits; // Wrap around to the last portrait
            } else {
                return (prevIndex + 1) % totalPortraits; // Wrap around to the first portrait
            }
        });
    };

    const handleDiceRoll = (result) => {
        // setMessages((prevMessages) => [
        //   ...prevMessages,
        //   { sender: 'Dice', text: `You rolled: ${result.total}` }
        // ]);
      };

    useEffect(() => {
        console.log('Character Stats in Character.js updated:', characterStats);
        console.log('Current Portrait Index:', currentPortraitIndex);
    }, [characterStats, setCharacterStats]);  // This will trigger when characterStats changes

    return (
        <div className="adventurer-panel">
            <div className="character">
                <h2>{characterStats.name}</h2>
                <div className="character-container">
                    <div className="left-column">
                    <CharacterPortrait 
                            currentPortraitIndex={currentPortraitIndex} 
                            changePortrait={changePortrait} 
                        />
                        <div className="character-attributes">
                            <h3>Character Attributes</h3>
                            <p><strong>Name:</strong> {characterStats.name}</p>
                            <p><strong>Class:</strong> Warrior</p>
                            <p><strong>Level:</strong> {characterStats.level}</p>
                            <p><strong>Race:</strong> Human</p>
                            <p><strong>Alignment:</strong> Neutral Good</p>
                        </div>
                        <div className="combat-stats">
                            <h3>Combat Stats</h3>
                            <ul>
                                <li><strong>Armor Class (AC):</strong> {characterStats.armorClass}</li>
                                <li><strong>Initiative:</strong> {characterStats.initiative}</li>
                                <li><strong>Hit Points (HP):</strong> {characterStats.hitPoints}</li>
                                <li><strong>Hit Die (HD):</strong> {characterStats.hitDie}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="right-column">
                    <div className="ability-scores">
                            <h3>Ability Scores</h3>
                            <ul>
                                <li><strong>Strength:</strong> {characterStats.strength}</li>
                                <li><strong>Dexterity:</strong> {characterStats.dexterity}</li>
                                <li><strong>Constitution:</strong> {characterStats.constitution}</li>
                                <li><strong>Intelligence:</strong> {characterStats.intelligence}</li>
                                <li><strong>Wisdom:</strong> {characterStats.wisdom}</li>
                                <li><strong>Charisma:</strong> {characterStats.charisma}</li>
                                <p><strong>Experience:</strong> {characterStats.experiencePoints}</p>
                            </ul>
                            {/* ReRoll Button */}
                            <button onClick={rollStats} className="roll-stats-button small-button">ReRoll</button>
                        </div>
                        <Inventory />
                        <div className="roll-dice-container">
                            <h3>Dice</h3>
                            {/* <button onClick={rollD20} className="roll-dice-button">Roll D20</button>
                            <div className="dice-animation">
                                {rolling ? (
                                    <p>Rolling...</p>
                                ) : (
                                    <p>{diceRoll !== null ? `Result: ${diceRoll}` : '🎲'}</p>
                                )}
                            </div> */}
                         <DiceComponent onDiceRoll={handleDiceRoll} />
                        </div>
                    </div>
                </div>
                Last built: {buildDate}
            </div>
        </div>
    );
};

export default Character;
