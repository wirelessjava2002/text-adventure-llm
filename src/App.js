import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CharacterCreation from './CharacterCreation';
import MainApp from './MainApp';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CharacterCreation />} /> {/* Default route */}
                <Route path="/main" element={<MainApp />} /> {/* Main application route */}
            </Routes>
        </Router>
    );
}

export default App;
