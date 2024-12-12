import React, { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";

const DiceComponent = () => {
  const diceBoxRef = useRef(null);
  const [rolledValue, setRolledValue] = useState(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize DiceBox only once when the component mounts
    const initializeDiceBox = () => {
      const dice = new DiceBox({
        element: "#dice-box",
        id: "dice-canvas",
        assetPath: "/assets/dice-box/",
        scale: 5,
        startingHeight: 8,
        throwForce: 6,
        spinForce: 5,
        lightIntensity: 1.0,
        theme: "default",
        themeColor: "#e68aaa",
        friction: 1.0,

      });

      return dice.init().then(() => {
        console.log("DiceBox initialized!");
        diceBoxRef.current = dice; // Store the instance in the ref
      });
    };

    if (!initializedRef.current) {
      console.log("DiceBox Mounted, in config!");
      initializeDiceBox();
      initializedRef.current = true; // Set to true after initialization
    }

    // Cleanup when the component unmounts
    return () => {
      if (diceBoxRef.current) {
        diceBoxRef.current.hide(); // Hide the canvas when the component unmounts
        diceBoxRef.current = null; // Clean up the reference
      }
    };
  }, []); // Empty dependency array ensures the effect runs only once

  const rollDice = () => {
    if (diceBoxRef.current) {
      diceBoxRef.current.show();
      diceBoxRef.current.roll("1d20"); // Adjust the roll as needed
    }
  };

  return (
    <div>
      <div id="dice-box" ></div>
        <button onClick={rollDice}>Roll Dice</button>
      <p>You rolled: {rolledValue}</p>
    </div>
  );
};

export default DiceComponent;
