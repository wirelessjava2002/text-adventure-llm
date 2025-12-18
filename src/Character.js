import React, { useEffect, useState } from "react";
import Inventory from "./Inventory";
import CharacterPortrait from "./CharacterPortrait";
import DiceComponent from "./DiceComponent";

const Character = ({ characterStats, setCharacterStats, onDiceRoll }) => {
  const buildDate = process.env.REACT_APP_BUILD_DATE;
  const [currentPortraitIndex, setCurrentPortraitIndex] = useState(0);
  const totalPortraits = 14;

  /* ---------------------
     Ability Score Reroll
     --------------------- */
  const rollStats = () => {
    const newStats = {
      strength: Math.floor(Math.random() * 16) + 5,
      dexterity: Math.floor(Math.random() * 16) + 5,
      constitution: Math.floor(Math.random() * 16) + 5,
      intelligence: Math.floor(Math.random() * 16) + 5,
      wisdom: Math.floor(Math.random() * 16) + 5,
      charisma: Math.floor(Math.random() * 16) + 5,
    };

    setCharacterStats((prev) => ({
      ...prev,
      ...newStats,
    }));
  };

  /* -------------------------
     Portrait Navigation
     ------------------------- */
  const changePortrait = (direction) => {
    setCurrentPortraitIndex((prevIndex) => {
      if (direction === "left") {
        return (prevIndex - 1 + totalPortraits) % totalPortraits;
      } else {
        return (prevIndex + 1) % totalPortraits;
      }
    });
  };

  const notifyDiceRoll = (result) => {
    console.log("Handle Dice Roll in Character.js updated:", result);
    onDiceRoll(result);
  };

  useEffect(() => {
    console.log("Character Stats in Character.js updated:", characterStats);
  }, [characterStats]);

  /* --------------------------------------------------------
     D&D STYLE CHARACTER PANEL (Two Columns, No Scrolling)
     -------------------------------------------------------- */
  return (
    <div className="character-panel">

      {/* ======== PORTRAIT SECTION ======== */}
      <div className="portrait-section">
        <CharacterPortrait
          currentPortraitIndex={currentPortraitIndex}
          changePortrait={changePortrait}
        />

        <h2 className="character-name">{characterStats.name}</h2>
        <p className="build-date">Build: {buildDate}</p>
      </div>

      {/* ======== MAIN GRID ======== */}
      <div className="character-grid">

        {/* COLUMN 1: Attributes */}
        <div className="stat-box">
          <h3>Character Attributes</h3>
          <ul>
            <li><strong>Class:</strong> Warrior</li>
            <li><strong>Level:</strong> {characterStats.level}</li>
            <li><strong>Race:</strong> Human</li>
            <li><strong>Alignment:</strong> Neutral Good</li>
            <li><strong>XP:</strong> {characterStats.experiencePoints}</li>
          </ul>
        </div>

        {/* COLUMN 2: Combat */}
        <div className="stat-box">
          <h3>Combat Stats</h3>
          <ul>
            <li><strong>Armor Class:</strong> {characterStats.armorClass}</li>
            <li><strong>Initiative:</strong> {characterStats.initiative}</li>
            <li><strong>Hit Points:</strong> {characterStats.hitPoints}</li>
            <li><strong>Hit Die:</strong> {characterStats.hitDie}</li>
          </ul>
        </div>

        {/* COLUMN 1: Ability Scores */}
        <div className="stat-box">
          <h3>Ability Scores</h3>
          <ul>
            <li><strong>STR:</strong> {characterStats.strength}</li>
            <li><strong>DEX:</strong> {characterStats.dexterity}</li>
            <li><strong>CON:</strong> {characterStats.constitution}</li>
            <li><strong>INT:</strong> {characterStats.intelligence}</li>
            <li><strong>WIS:</strong> {characterStats.wisdom}</li>
            <li><strong>CHA:</strong> {characterStats.charisma}</li>
          </ul>
          <button onClick={rollStats} className="reroll-button">
            Re-roll Stats
          </button>
        </div>

        {/* COLUMN 2: Dice Roller */}
        <div className="stat-box">
          <h3>Dice Roller</h3>
          <DiceComponent onDiceRoll={notifyDiceRoll} />
        </div>

        {/* Full-width Inventory */}
        <div className="stat-box full-width">
          <h3>Inventory</h3>
          <Inventory />
        </div>

      </div>
    </div>
  );
};

export default Character;
