import React, { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";

const DiceComponent = ({ onDiceRoll }) => {
  const diceBoxRef = useRef(null);
  const [rolledValue, setRolledValue] = useState(null);
  const initializedRef = useRef(false);
  const lastRollRef = useRef({ value: null, ts: 0 });

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
      // Extract_numeric_value (your existing logic)
      const firstRoll = rollResult?.[0];
      const newValue = firstRoll?.rolls?.[0]?.value;

      if (newValue == null) return;

      const now = Date.now();

      // ---- DEDUPE LOGIC ----
      const last = lastRollRef.current;
      const isDuplicateValue = last.value === newValue;
      const isTooSoon = now - last.ts < 300;   // 300ms dedupe window

      if (isDuplicateValue && isTooSoon) {
        console.log("IGNORED DUPLICATE DICE EVENT:", newValue);
        return; // 💥 Prevent double-processing
      }

      // Store this event
      lastRollRef.current = { value: newValue, ts: now };

      // ---- Process legitimate roll ----
      console.log("ACCEPTED DICE EVENT:", newValue);

      setRolledValue(newValue);
      onDiceRoll(newValue);
    };
      

      return dice.init().then(() => {
        console.log("DiceBox initialized!");
        diceBoxRef.current = dice; // Store the instance in the ref
      });
    };

    if (!initializedRef.current) {
      console.log("DiceBox Mounted, in config!");
      initializeDiceBox();
      initializedRef.current = true;
    }

    // Cleanup when the component unmounts
    return () => {
      if (diceBoxRef.current) {
        diceBoxRef.current.hide(); 
        diceBoxRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures the effect runs only once

  const rollDice = () => {
    if (diceBoxRef.current) {
      console.log("Rolling the dice..."); 
      diceBoxRef.current.show();
      diceBoxRef.current.roll("1d20");
    } else {
      console.error("DiceBox is not initialized.");
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
