import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CharacterCreation from "./CharacterCreation";
import MainApp from "./MainApp";
import { loginUrl, logoutUrl } from "./authConfig";

function App() {
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        setAuthToken(token);
        window.history.replaceState({}, document.title, "/main");
      }
    }
  }, []);

  return (
    <Router>
      <div style={{ padding: "8px" }}>
        {!authToken ? (
          <button onClick={() => window.location.href = loginUrl}>
            Login / Sign up
          </button>
        ) : (
          <button onClick={() => {
            setAuthToken(null);
            window.location.href = logoutUrl;
          }}>
            Logout
          </button>
        )}
      </div>

      <Routes>
        <Route path="/" element={<CharacterCreation />} />
        <Route
          path="/main"
          element={<MainApp authToken={authToken} />}
        />
      </Routes>
    </Router>
  );
}

export default App;

