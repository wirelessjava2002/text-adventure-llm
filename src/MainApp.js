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


  /* ---------- Send player input ---------- */

const processMessage = async (messageText) => {
  setMessages(prev => [...prev, { sender: 'User', text: messageText }]);

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

    parseResponse(
      response.data.narrative,
      setCharacterStats,
      characterStatsState
    );

  } catch (error) {
    console.error('Error communicating with backend:', error);
    setMessages(prev => [
      ...prev,
      {
        sender: 'GM',
        text: '⚠️ LLM JSON parse failed. Check logs.',
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

    setPendingDice(null); // clear UI state

    await axios.post(
      process.env.REACT_APP_BACKEND_API_URL,
      {
        event: 'DICE_RESULT',
        dice: pendingDice.dice,
        result: rolledValue,
        reason: pendingDice.reason
      },
      { headers }
    );
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
      <div className="left-panel">
        <Character
          characterStats={characterStatsState}
          setCharacterStats={setCharacterStats}
          currentPortraitIndex={currentPortraitIndexState}
          onDiceRoll={handleDiceRoll}
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

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="What do you do?"
            required
            className="input-box"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default MainApp;
