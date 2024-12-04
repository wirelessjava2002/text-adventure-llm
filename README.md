# 🏰 Text Adventure Game with Gemini 1.5 Flash

Welcome to the **Text Adventure Game**! This project is a fun and interactive text-based adventure game that utilizes the **Gemini 1.5 Flash** model as the game master. Players can type commands and interact with the game world, while Gemini generates responses to guide the adventure.

## 📜 Project Description

This project aims to recreate the nostalgic experience of classic text adventure games, where players navigate through a fantasy world using text commands. The game leverages the power of the Gemini AI to provide dynamic storytelling and responses, making each playthrough unique.

## ✨ Features

- **Interactive Gameplay**: Players can type commands to interact with the game world.
- **Dynamic Responses**: The Gemini AI generates responses based on player input, creating a rich narrative experience.
- **Dungeons & Dragons Theme**: The interface is designed to evoke the feel of classic D&D adventures, complete with a parchment-like background and retro fonts.
- **User-Friendly Interface**: A clean and intuitive layout that allows players to focus on the adventure.

## 📦 Installation

To get started with the Text Adventure Game, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/text-adventure-game.git
   cd text-adventure-game
   ```

2. **Install Dependencies**:
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add your API key:
   ```plaintext
   API_KEY=your_google_api_key
   ```

4. **Start the Development Server**:
   ```bash
   npm start
   ```

5. **Open Your Browser**:
   Navigate to `http://localhost:3000` to start playing!

6. **On Push Pipeline Deploy**:
   `https://text-adventure-llm.onrender.com/`

   https://dashboard.render.com/

## 🎮 Usage

Once the application is running, you can start your adventure by typing commands into the input box at the bottom of the screen. The game will respond with text-based narratives and options based on your input.

### Example Commands:
- `look around`
- `go north`
- `take sword`
- `talk to the wizard`

## 📊 Application Flow

```mermaid
graph TD;
    A[User Input] --> B{Process Input};
    B -->|Valid Command| C[Send to Gemini AI];
    B -->|Invalid Command| D[Display Error Message];
    C --> E[Receive Response];
    E --> F[Update Chat Window];
    F --> A;
```

## 📱 Screenshots

![Game Interface](https://via.placeholder.com/800x400?text=Game+Interface+Screenshot)

## 🛠️ Technologies Used

- **React**: For building the user interface.
- **Axios**: For making HTTP requests to the backend.
- **Gemini 1.5 Flash**: The AI model used for generating game responses.
- **CSS**: For styling the application with a D&D theme.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## 📄 License


This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📫 Contact

For any inquiries, please reach out.
---

Happy adventuring! May your quests be filled with excitement and discovery! 🧙‍♂️✨
