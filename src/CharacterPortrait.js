import React from 'react';

const CharacterPortrait = ({ currentPortraitIndex, changePortrait }) => {
    const totalPortraits = 14; // Total number of portraits

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
