import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Character from './Character';
import parseResponse from './utils/parseResponse';



function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const endOfMessagesRef = useRef(null);
  const [currentPortraitIndex, setCurrentPortraitIndex] = useState(0);

  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);    
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const initialContextPrompt = "You are a Dungeon Master in a fantasy game setting using the D20 rules system. Guide the players through their adventure and respond in character with one or 2 scentance responses. You must stay in charactter at all times. Intermittently award player EXP in the format number then the words 'experience points' when they achieve anything in the game, like killing a monster or finding an item";

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
    hitDie: "1d8",
    experiencePoints: 0,
    level: 1
  });

  const handlePortraitChange = (newIndex) => {
    console.log("Portrait changed to index:", newIndex);
    setCurrentPortraitIndex(newIndex); // Update state in App.js
  };


  useEffect(() => {
    const initializeGame = async () => {
        if (!isInitialized) {
            try {
                const response = await axios.post(process.env.REACT_APP_BACKEND_API_URL, 
                  { message: `${initialContextPrompt} At the start, describe the setting for the adventure in great detail.`},
                  { headers: { 'client-id': 'AppInitialization' } }
                );

                const initialSetting = { sender: 'GM', text: response.data.reply };
                setMessages((prevMessages) => [...prevMessages, initialSetting]);
                setIsInitialized(true); // Ensures this runs only once
                console.log('Request sent to backend engine:');
                //await diceBox.init()
            } catch (error) {
                console.error('Error initializing game:', error);
            }
        }
    };

    initializeGame();
}, [isInitialized]);


  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log('App.j Current Portrait Index:', currentPortraitIndex);
  }, [messages]);

  const handleDiceRoll = (result) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'Dice', text: `You rolled: ${result.total}` }
    ]);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userMessage = { sender: 'User', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
        const contextMessages = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
        const fullMessage = `${initialContextPrompt}\n${contextMessages}\nUser: ${input}`;

        const response = await axios.post(process.env.REACT_APP_BACKEND_API_URL, 
          { message: fullMessage},
          { headers: { 'client-id': 'AppInitialization' } }
        );

        const geminiMessage = { sender: 'GM', text: response.data.reply };
        setMessages((prevMessages) => [...prevMessages, geminiMessage]);

        // Call parseResponse with updated state
        parseResponse(response.data.reply, setCharacterStats, characterStats);

       // diceBox.roll('2d20');

    } catch (error) {
        console.error('Error communicating with Gemini:', error);
        setMessages((prevMessages) => [...prevMessages, { sender: 'GM', text: 'Unable to get a response. server may be initialising. Please refresh, go grab a beer and come back a little later' }]);
    }

    setInput('');
};


  const rollDice = () => {
    setRolling(true);
    const newValue = Math.floor(Math.random() * 20) + 1;
    setDiceValue(newValue);
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, { sender: 'Dice', text: `You rolled a: ${newValue}` }]);
      setRolling(false);
    }, 1000);
  };

  return (
    <div className="App">
      <div className="left-panel">
        <div className="title-banner" style={{ backgroundImage: `url('/assets/fantasy-banner.png')` }}>
          <h1>Lands of Eldoria</h1>
          <h2>Party like it's 1984</h2>
          <p>Welcome brave adventurer, please be patient as this is a <strong>free server</strong>, so may take an age to spin up when idle. Hit refresh, grab an Ale, come back and enjoy!🍺</p>
        </div>
      {/* <DiceComponent onDiceRoll={handleDiceRoll} /> */}
        <Character characterStats={characterStats} setCharacterStats={setCharacterStats} currentPortraitIndex={currentPortraitIndex}/>
      </div>
      <div className="right-panel">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'User' ? 'user-message' : msg.sender === 'Dice' ? 'dice-message' : 'gemini-message'}>
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

export default App;