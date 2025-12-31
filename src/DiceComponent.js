import React, { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";


const DiceComponent = ({ onDiceRoll, onLocalRoll, dice = "1d20"  }) => {
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
      const firstGroup = rollResult?.[0];
      if (!firstGroup?.rolls?.length) return;

      // 🎲 Sum ALL dice (supports 3d6, 1d20, etc.)
      const total = firstGroup.rolls.reduce(
        (sum, roll) => sum + roll.value,
        0
      );

      const now = Date.now();

      // ---- DEDUPE LOGIC ----
      const last = lastRollRef.current;
      const isDuplicateValue = last.value === total;
      const isTooSoon = now - last.ts < 300;

      if (isDuplicateValue && isTooSoon) {
        console.log("IGNORED DUPLICATE DICE EVENT:", total);
        return;
      }

      lastRollRef.current = { value: total, ts: now };

      console.log(
        "ACCEPTED DICE EVENT:",
        total,
        "(dice:",
        firstGroup.rolls.map(r => r.value).join(","),
        ")"
      );

      setRolledValue(total);

      // 🔀 LOCAL vs GAP MODE
      if (onLocalRoll) {
        onLocalRoll(total);   // Character creation
      } else if (onDiceRoll) {
        onDiceRoll(total);    // Main game (Dice GAP)
      }

      // 🟡 Start fade after 4s
      setTimeout(() => {
        const el = document.getElementById("dice-canvas");
        if (el) el.classList.add("fade-out");
      }, 4000);

      // 🔴 Clear + hide after fade completes
      setTimeout(() => {
        dice.clear();
        dice.hide();

        const el = document.getElementById("dice-canvas");
        if (el) el.classList.remove("fade-out");
      }, 5000);
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
      diceBoxRef.current.roll(dice);
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
