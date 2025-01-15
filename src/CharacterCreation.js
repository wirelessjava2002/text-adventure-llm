import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import CharacterPortrait from './CharacterPortrait';
import './CharacterCreation.css'; // Import the CSS file for styles

const CharacterCreation = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [characterStats, setCharacterStats] = useState({
        name: 'Adventurer',
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        armorClass: 10,
        initiative: 0,
        hitPoints: 10,
        hitDie: "1d8",
        experiencePoints: 0,
        level: 1
    });
    const [currentPortraitIndex, setCurrentPortraitIndex] = useState(0); // State for current portrait index

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCharacterStats((prevStats) => ({
            ...prevStats,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Character Created:', characterStats);
        // Here you can handle the character creation logic, such as saving to a database or navigating to another page
    };

    const navigateToMainApp = () => {
        navigate('/main', { state: { characterStats, currentPortraitIndex } }); // Pass character stats and portrait index as state
    };

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

    return (
        <div className="character-creation-container">
            <div className="left-section"> {/* Left Section */} </div>
            <div className="middle-section"> {/* Middle Section */}
                <h1>Create Your Character</h1>
                <CharacterPortrait totalPortraits={14} />
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={characterStats.name}
                            onChange={handleInputChange}
                            required
                        />
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
                            <p><strong>Experience:</strong> {characterStats.experiencePoints}</p>
                        </ul>
                        <button onClick={rollStats} className="roll-stats-button small-button">ReRoll</button>
                    </div>
                </form>
                <button onClick={navigateToMainApp}>Save & Continue</button> {/* Button to navigate */}
            </div>
            <div className="right-section"> {/* Right Section */} </div>
        </div>
    );
};

export default CharacterCreation;
