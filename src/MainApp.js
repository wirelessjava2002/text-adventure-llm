import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './App.css';
import Character from './Character';
import parseResponse from './utils/parseResponse';

function MainApp({ authToken }) {
  const location = useLocation();
  const { characterStats, currentPortraitIndex } = location.state || {};

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const endOfMessagesRef = useRef(null);
  const initLock = useRef(false);
  const [pendingDice, setPendingDice] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);
  const [responseActions, setResponseActions] = useState([]);

  const [currentPortraitIndexState, setCurrentPortraitIndex] = useState(
    currentPortraitIndex || 0
  );

  const [characterStatsState, setCharacterStats] = useState(
    characterStats || {
      name: 'Adventurer',
      strength: 15,
      dexterity: 12,
      constitution: 14,
      intelligence: 15,
      wisdom: 13,
      charisma: 10,
      armorClass: 16,
      initiative: 2,
      hitPoints: 20,
      hitDie: '1d8',
      experiencePoints: 0,
      level: 1,
    }
  );

  const applyXP = (amount) => {
    setCharacterStats(prev => ({
      ...prev,
      experiencePoints: (prev.experiencePoints || 0) + amount
    }));
  };

  const handleXPFromActions = (actions = []) => {
    actions.forEach(action => {
      if (action.type === 'AWARD_XP') {
        applyXP(action.payload.amount);
        setXpPopup({
          amount: action.payload.amount,
          reason: action.payload.reason
        });
      }
    });
  };


  /* ---------- Initial game start ---------- */

  useEffect(() => {
    if (initLock.current) return;
    initLock.current = true;

    const initializeGame = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'client-id': 'AppInitialization',
        };

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await axios.post(
          process.env.REACT_APP_BACKEND_API_URL,
          { input: 'Start the adventure. Describe the setting in detail.' },
          { headers }
        );

        setMessages([
          { sender: 'GM', text: response.data.narrative },
        ]);
      } catch (error) {
        console.error('Error initializing game:', error);
      }
    };

    initializeGame();
  }, [authToken]);

  /* ---------- Auto-scroll ---------- */

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

    
  /* ---------- XP Popup ---------- */
  useEffect(() => {
    if (!xpPopup) return;

    const timer = setTimeout(() => setXpPopup(null), 3000);
    return () => clearTimeout(timer);
  }, [xpPopup]);


  /* ---------- Send player input ---------- */

const processMessage = async (messageText) => {
  setMessages(prev => [...prev, { sender: 'User', text: messageText }]);
  setResponseActions([]);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'client-id': 'AppInitialization',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(
      process.env.REACT_APP_BACKEND_API_URL,
      { input: messageText },
      { headers }
    );
    console.log("BACKEND ACTIONS:", response.data.actions);
    setResponseActions(response.data.actions || []);

    // 🎲 Dice GAP: backend is pausing for a roll
    if (response.data.actions?.[0]?.type === 'REQUEST_DICE_ROLL') {
      setPendingDice(response.data.actions[0].payload);

      // Show the narrative that led to the roll
      setMessages(prev => [
        ...prev,
        { sender: 'GM', text: response.data.narrative },
      ]);

      return; // ⛔ stop here, wait for dice
    }

    // ✅ Normal flow (no dice requested)
    setMessages(prev => [
      ...prev,
      { sender: 'GM', text: response.data.narrative },
    ]);


    // XP popup
    handleXPFromActions(response.data.actions);

    parseResponse(
      response.data.narrative,
      setCharacterStats,
      characterStatsState
    );

    handleXPFromActions(response.data.actions);


  } catch (error) {
    console.error('Error communicating with backend:', error);
    setMessages(prev => [
      ...prev,
      {
        sender: 'GM',
        text: '⚠️ Error communicating with backend: ' + error,
      },
    ]);
  }
};


  /* ---------- 🎲 Dice handling  ---------- */

const handleDiceRoll = async (rolledValue) => {
  if (!pendingDice) return;

  setMessages(prev => [
    ...prev,
    { sender: 'Dice', text: `Rolled ${pendingDice.dice}: ${rolledValue}` }
  ]);

  const headers = {
    'Content-Type': 'application/json',
    'client-id': 'AppInitialization',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await axios.post(
    process.env.REACT_APP_BACKEND_API_URL,
    {
      event: 'DICE_RESULT',
      dice: pendingDice.dice,
      result: rolledValue,
      reason: pendingDice.reason
    },
    { headers }
  );

  setResponseActions(response.data.actions || []);

  setPendingDice(null); // resume normal play

  setMessages(prev => [
    ...prev,
    { sender: 'GM', text: response.data.narrative }
  ]);

  // XP / stat parsing happens here
  parseResponse(
    response.data.narrative,
    setCharacterStats,
    characterStatsState
  );

  handleXPFromActions(response.data.actions);


};

  /* ---------- Input handlers ---------- */

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    processMessage(input);
    setInput('');
  };

  /* ---------- Render ---------- */

  return (
    <div className="App">
      {xpPopup && (
        <div className="xp-popup">
          ⭐ +{xpPopup.amount} XP
          <br />
          <small>{xpPopup.reason}</small>
        </div>
      )}
      <div className="left-panel">
        <Character
          characterStats={characterStatsState}
          setCharacterStats={setCharacterStats}
          currentPortraitIndex={currentPortraitIndexState}
          onDiceRoll={handleDiceRoll}
          pendingDice={pendingDice}
        />
      </div>

      <div className="right-panel">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender === 'User'
                  ? 'user-message'
                  : 'gm-message'
              }
            >
              {msg.sender === 'User' && (
                <img
                  src={`assets/portraits/${currentPortraitIndexState + 1}.png`}
                  alt="User"
                  className="user-portrait"
                />
              )}

              {msg.sender === 'GM' && (
                <img
                  src="assets/portraits/5.png"
                  alt="GM"
                  className="gm-portrait"
                />
              )}

              <div>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>

        {!pendingDice && responseActions.length > 0 && (
          <div className="suggestions">
            {responseActions
              .filter(a => a.type === 'SUGGEST_ACTION')
              .map((action, index) => (
                <button
                  key={index}
                  className="suggestion-button"
                  onClick={() => {
                    setResponseActions([]);
                    processMessage(action.payload.input);
                  }}
                >
                  {action.payload.label}
                </button>
              ))}
          </div>
        )}

        {pendingDice && (
          <div className="dice-prompt">
            <p>
              🎲 <strong>Roll {pendingDice.dice}</strong>
              <br />
              <em>{pendingDice.reason}</em>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={
              pendingDice ? 'Roll the dice to continue...' : 'Type your request?'
            }
            disabled={!!pendingDice}
            required
            className="input-box"
          />
          <button type="submit" disabled={!!pendingDice}>
            Reply
          </button>
        </form>
      </div>
    </div>
  );
}

export default MainApp;
