import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './App.css';
import Character from './Character';
import parseResponse from './utils/parseResponse';



function MainApp() {
    const location = useLocation();
    const { characterStats, currentPortraitIndex } = location.state || {};

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [diceValue, setDiceValue] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const endOfMessagesRef = useRef(null);
    const initLock = useRef(false);


    const [currentPortraitIndexState, setCurrentPortraitIndex] = useState(currentPortraitIndex || 0);

    const initialContextPrompt = "You are a Dungeon Master in a fantasy game setting using the D20 rules system. Guide the players through their adventure and respond in character with 2 or 3 sentence responses. You must stay in character at all times. Intermittently award player EXP in the format number then the words 'experience points' when they achieve anything in the game, like killing a monster or finding an item. Only accept a dice roll number if you say roll the dice";

    const [characterStatsState, setCharacterStats] = useState(characterStats || {
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
        hitDie: "1d8",
        experiencePoints: 0,
        level: 1
    });

  const handlePortraitChange = (newIndex) => {
    console.log("Portrait changed to index:", newIndex);
    setCurrentPortraitIndex(newIndex); // Update state in MainApp.js
  };

    useEffect(() => {
    if (initLock.current) return;  // <-- prevents StrictMode double-run
    initLock.current = true;

    const initializeGame = async () => {
        try {
        const response = await axios.post(process.env.REACT_APP_BACKEND_API_URL, 
            { message: `${initialContextPrompt} At the start, describe the setting for the adventure in great detail.` },
            { headers: { 'client-id': 'AppInitialization' } }
        );

        const initialSetting = { sender: 'GM', text: response.data.reply };
        setMessages(prev => [...prev, initialSetting]);
        setIsInitialized(true);

        } catch (error) {
        console.error('Error initializing game:', error);
        }
    };

    initializeGame();
    }, []);


    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
        console.log('App.j Current Portrait Index:', currentPortraitIndex);
    }, [messages]);

  const processMessage = async (messageText) => {
    const userMessage = { sender: 'User', text: messageText };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

        try {
            const contextMessages = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
            const fullMessage = `${initialContextPrompt}\n${contextMessages}\nUser: ${messageText}`;

            const response = await axios.post(process.env.REACT_APP_BACKEND_API_URL, 
                { message: fullMessage },
                { headers: { 'client-id': 'AppInitialization' } }
            );

            const llmMessage = { sender: 'GM', text: response.data.reply };
            setMessages((prevMessages) => [...prevMessages, llmMessage]);

            parseResponse(response.data.reply, setCharacterStats, characterStatsState);
        } catch (error) {
            console.error('Error communicating with backend LLM:', error);
            setMessages((prevMessages) => [...prevMessages, { sender: 'GM', text: 'Unable to get a response. Server may be initializing. Please refresh, grab a beer, and come back a little later.' }]);
        }
    };

const handleDiceRoll = (rolledValue) => {
  console.log("HANDLE DICE ROLL FIRED");
  console.log("Dice rolled in App:", rolledValue);

  const diceRollMessage = `Rolled a dice and got ${rolledValue}`;

  // 1️⃣ Add the user message once
  setMessages(prev => {
    return [...prev, { sender: 'User', text: diceRollMessage }];
  });

  // 2️⃣ Build context separately
  const contextMessages = [...messages, { sender: 'User', text: diceRollMessage }]
    .map(msg => `${msg.sender}: ${msg.text}`)
    .join('\n');

  const fullMessage = `${initialContextPrompt}\n${contextMessages}`;

  // 3️⃣ Call LLM OUTSIDE of setMessages updater
  sendToLLM(fullMessage);
};

const sendToLLM = async (fullMessage) => {
  try {
      const response = await axios.post(process.env.REACT_APP_BACKEND_API_URL, 
        { message: fullMessage },
        { headers: { 'client-id': 'AppInitialization' } }
      );

      // Update the chat window with the GM's reply
      const llmMessage = { sender: 'GM', text: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, llmMessage]);

            // Parse the response for game logic
            parseResponse(response.data.reply, setCharacterStats, characterStatsState);
        } catch (error) { }
    };

const handleInputChange = (event) => {
    setInput(event.target.value);
};

const handleSubmit = (event) => {
    event.preventDefault();
    processMessage(input);
    setInput(''); // Clear input after submission
};

    return (
        <div className="App">
            <div className="left-panel">
                <Character characterStats={characterStatsState} setCharacterStats={setCharacterStats} currentPortraitIndex={currentPortraitIndexState} onDiceRoll={handleDiceRoll}/>
            </div>
            <div className="right-panel">
                <div className="chat-window">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={
                                msg.sender === 'User' ? "user-message"
                                : msg.sender === 'Dice' ? "dice-message"
                                : "gm-message"
                            }
                        >
                            {msg.sender === 'User' && (
                                <img 
                                    src={`assets/portraits/${(currentPortraitIndex + 1).toString()}.png`}
                                    alt={`User Portrait`}
                                    className="user-portrait"
                                />
                            )}
                            {msg.sender === 'GM' && (
                                <img 
                                    src={`assets/portraits/5.png`}
                                    alt={`GM Portrait ${index + 1}`}
                                    className="gm-portrait"
                                />
                            )}
                            <div>
                                <strong>{msg.sender}:</strong> {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={endOfMessagesRef}></div>
                </div>
                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your command..."
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