import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Character from './Character';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const endOfMessagesRef = useRef(null);

  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);    
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const initialContextPrompt = "You are a Dungeon Master in a fantasy game setting using the D20 rules system. Guide the players through their adventure and respond in character with one or 2 scentance responses. You must stay in charactter at all times. Intermittently award the player experience points when they achieve anything in the game, like killing a monster or finding an item";

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

  useEffect(() => {
    const initializeGame = async () => {
      if (!isInitialized) {
        try {
          const response = await axios.post('http://localhost:5000/api/chat', {
            message: `${initialContextPrompt} Describe the setting for the adventure.`
          });
          const initialSetting = { sender: 'GM', text: response.data.reply };
          setMessages((prevMessages) => [...prevMessages, initialSetting]);
          setIsInitialized(true);
        } catch (error) {
          console.error('Error initializing game:', error);
        }
      }
    };

    initializeGame();
  }, [isInitialized]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userMessage = { sender: 'User', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
        // Create a context string from the messages array
        const contextMessages = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
        
        // Include the initial context prompt and the user's message
        const fullMessage = `${initialContextPrompt}\n${contextMessages}\nUser: ${input}`;

        const response = await axios.post('http://localhost:5000/api/chat', {
            message: fullMessage // Send the full context to the API
        });

        const geminiMessage = { sender: 'GM', text: response.data.reply };
        setMessages((prevMessages) => [...prevMessages, geminiMessage]);
    } catch (error) {
        console.error('Error communicating with Gemini:', error);
        const errorMessage = { sender: 'GM', text: 'Error: Unable to get a response.' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
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
        <h1>Game Master</h1>
        <p>Welcome to the Text Adventure Game! Here you can find instructions and lore.</p>
        <Character characterStats={characterStats} messages={messages} sendMessage={handleSubmit} />
      </div>
      <div className="right-panel">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'User' ? 'user-message' : msg.sender === 'Dice' ? 'dice-message' : 'gemini-message'}>
              <strong>{msg.sender}:</strong> {msg.text}
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