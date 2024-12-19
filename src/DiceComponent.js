import React, { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";

const DiceComponent = ({ onDiceRoll }) => {
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
        scale: 6,
        startingHeight: 8,
        throwForce: 7,
        spinForce: 8,
        lightIntensity: 1.0,
        theme: "default",
        themeColor: "#e68aaa",
        friction: 2.0,
      });

      dice.onRollComplete = (rollResult) => {
        console.log("Roll results:", rollResult);
      
        // Ensure rollResult is an array and has at least one item
        if (Array.isArray(rollResult) && rollResult.length > 0) {
          const firstRoll = rollResult[0];
          if (firstRoll.rolls && firstRoll.rolls.length > 0) {
            const value = firstRoll.rolls[0].value; // Extract the value
            console.log("Extracted value:", value);
            setRolledValue(value); // Update the state
            onDiceRoll(value);
          } else {
            console.error("No rolls found in the first result.");
          }
        } else {
          console.error("Invalid roll result:", rollResult);
        }
      };
      

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
      console.log("Rolling the dice..."); // Debugging statement
      diceBoxRef.current.show();
      diceBoxRef.current.roll("1d20"); // Adjust the roll as needed
    } else {
      console.error("DiceBox is not initialized."); // Error handling
    }
  };

  return (
    <div>
      <div id="dice-box"></div>
      <button onClick={rollDice}>Roll Dice</button>
      <p>You rolled: {rolledValue !== null ? rolledValue : 'Roll the dice!'}</p>
    </div>
  );
};

export default DiceComponent;
