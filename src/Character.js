import React, { useState } from 'react';
import Inventory from './Inventory';
import Dice from './Dice';

const Character = () => {
    const [characterStats, setCharacterStats] = useState({
        name: "Adventurer",
        strength: 15,
        dexterity: 12,
        constitution: 14,
        intelligence: 15,
        wisdom: 13,
        charisma: 10,
        armorClass: 16,
        initiative: 2,
        hitPoints: 20,
        hitDie: "1d8"
    });

    const [characterAttributes] = useState({
        name: "Player1",
        class: "Warrior",
        level: 1,
        race: "Human",
        alignment: "Neutral Good"
    });

    const [diceRoll, setDiceRoll] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [currentInput, setCurrentInput] = useState("");

    const rollStats = () => {
        const newStats = {
            strength: Math.floor(Math.random() * 16) + 5,
            dexterity: Math.floor(Math.random() * 16) + 5,
            constitution: Math.floor(Math.random() * 16) + 5,
            intelligence: Math.floor(Math.random() * 16) + 5,
            wisdom: Math.floor(Math.random() * 16) + 5,
            charisma: Math.floor(Math.random() * 16) + 5,
        };
        setCharacterStats((prevStats) => ({
            ...prevStats,
            ...newStats,
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

    return (
        <div className="adventurer-panel">
            <div className="character">
                <h2>{characterStats.name}</h2>
                <div className="character-container">
                    <div className="left-column">
                        <div className="character-attributes">
                            <h3>Character Attributes</h3>
                            <p><strong>Name:</strong> {characterAttributes.name}</p>
                            <p><strong>Class:</strong> {characterAttributes.class}</p>
                            <p><strong>Level:</strong> {characterAttributes.level}</p>
                            <p><strong>Race:</strong> {characterAttributes.race}</p>
                            <p><strong>Alignment:</strong> {characterAttributes.alignment}</p>
                        </div>
                        <div className="ability-scores">
                            <h3>Ability Scores</h3>
                            <ul>
                                <li><strong>Strength:</strong> {characterStats.strength}</li>
                                <li><strong>Dexterity:</strong> {characterStats.dexterity}</li>
                                <li><strong>Constitution:</strong> {characterStats.constitution}</li>
                                <li><strong>Intelligence:</strong> {characterStats.intelligence}</li>
                                <li><strong>Wisdom:</strong> {characterStats.wisdom}</li>
                                <li><strong>Charisma:</strong> {characterStats.charisma}</li>
                            </ul>
                            <button onClick={rollStats} className="roll-stats-button small-button">ReRoll</button>
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
                        <Inventory />
                        <div className="roll-dice-container">
                            <h3>Dice</h3>
                            <button onClick={rollD20} className="roll-dice-button">Roll D20</button>
                            <div className="dice-animation">
                                {rolling ? (
                                    <p>Rolling...</p>
                                ) : (
                                    <p>{diceRoll !== null ? `Result: ${diceRoll}` : '🎲'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Character;
