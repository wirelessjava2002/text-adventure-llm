import React, { useState } from 'react';
import './CharacterCreation.css'; 

const CharacterPortrait = ({ totalPortraits = 14 }) => {
    const [currentPortraitIndex, setCurrentPortraitIndex] = useState(0); // State for current portrait index

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

    return (
        <div className="character-portrait">
            <img 
                src={`assets/portraits/${currentPortraitIndex + 1}.png`} 
                alt={`Character Portrait ${currentPortraitIndex + 1}`} 
                className="portrait-image"
            />
            <div className="portrait-navigation">
                <button onClick={() => changePortrait('left')}>&lt; Previous</button>
                <button onClick={() => changePortrait('right')}>Next &gt;</button>
            </div>
        </div>
    );
};

export default CharacterPortrait;
