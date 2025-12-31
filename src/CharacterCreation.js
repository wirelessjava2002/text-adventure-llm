import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterPortrait from './CharacterPortrait';
import DiceComponent from './DiceComponent';
import './CharacterCreation.css';

const rollStat = () =>
  Math.floor(Math.random() * 6 + 1) +
  Math.floor(Math.random() * 6 + 1) +
  Math.floor(Math.random() * 6 + 1);

const rollAllStats = () => ({
  strength: rollStat(),
  dexterity: rollStat(),
  constitution: rollStat(),
  intelligence: rollStat(),
  wisdom: rollStat(),
  charisma: rollStat(),
});


const CharacterCreation = () => {
    const navigate = useNavigate();
    const [pendingStat, setPendingStat] = useState(null);
    const [rolledStats, setRolledStats] = useState({});
    const [characterStats, setCharacterStats] = useState(() => ({
        name: 'Adventurer',
        ...rollAllStats(),
        armorClass: 10,
        initiative: 0,
        hitPoints: 10,
        hitDie: '1d8',
        experiencePoints: 0,
        level: 1,
    }));

  const [currentPortraitIndex, setCurrentPortraitIndex] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCharacterStats(prev => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleStatRoll = (value) => {
    if (!pendingStat) return;

    setCharacterStats(prev => ({
        ...prev,
        [pendingStat]: value,
    }));

    setRolledStats(prev => ({
        ...prev,
        [pendingStat]: true,
    }));

    setPendingStat(null);
    };


    const rerollAllStats = () => {
    setCharacterStats(prev => ({
        ...prev,
        strength: rollStat(),
        dexterity: rollStat(),
        constitution: rollStat(),
        intelligence: rollStat(),
        wisdom: rollStat(),
        charisma: rollStat(),
    }));

    setRolledStats({});     // 🔓 re-enable all roll buttons
    setPendingStat(null);  // 🧹 safety reset
    };


  const beginAdventure = () => {
    navigate('/main', {
      state: {
        characterStats,
        currentPortraitIndex,
      },
    });
  };

  return (
    <div className="character-creation-container">
      <div className="middle-section">
        <h1 className="creation-title">Create Your Character</h1>

        <CharacterPortrait
          currentPortraitIndex={currentPortraitIndex}
          setCurrentPortraitIndex={setCurrentPortraitIndex}
          totalPortraits={14}
          editable={true}
        />

        <div className="character-form">
          <label className="name-label">Name</label>
          <input
            type="text"
            name="name"
            value={characterStats.name}
            onChange={handleInputChange}
            className="name-input"
          />

          <div className="ability-scores">
            <h3>Ability Scores (3d6)</h3>
                <ul className="stat-list">
                {[
                    "strength",
                    "dexterity",
                    "constitution",
                    "intelligence",
                    "wisdom",
                    "charisma"
                ].map(stat => (
                    <li key={stat} className="stat-row">
                    <span className="stat-name">
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </span>

                    <span className="stat-value">
                        {characterStats[stat]}
                    </span>

                    <button
                        className="stat-roll-button"
                        disabled={rolledStats[stat] || pendingStat !== null}
                        onClick={() => setPendingStat(stat)}
                    >
                        🎲 Roll
                    </button>
                    </li>
                ))}
                </ul>

            {pendingStat && (
            <div className="dice-roll-area">
                <p>
                🎲 Rolling 3d6 for <strong>{pendingStat.toUpperCase()}</strong>
                </p>
                <DiceComponent
                dice="3d6"
                onLocalRoll={handleStatRoll}
                />
            </div>
            )}

            <button
              className="themed-button secondary"
              onClick={rerollAllStats}
            >
              🔄 Re-roll Fate
            </button>
          </div>

          <button
            className="themed-button primary"
            onClick={beginAdventure}
          >
            ⚔️ Begin Adventure
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;
