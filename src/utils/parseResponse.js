// src/utils/parseResponse.js
import parseExperiencePoints from './parseExperiencePoints';
import calculateLevel from './levelUp';

const parseResponse = (responseText, setCharacterStats, prevStats) => {
    const experiencePoints = parseExperiencePoints(responseText);
    console.log("Parsed Experience Points:", experiencePoints); // Log the parsed experience points

    if (experiencePoints > 0) {
        setCharacterStats((prevStats) => {
            // Update experience points by adding the parsed value
            const updatedStats = {
                ...prevStats,
                experiencePoints: prevStats.experiencePoints + experiencePoints,
                level: calculateLevel(prevStats.experiencePoints + experiencePoints) // Update level based on new experience points
            };
            console.log("Updated Stats:", updatedStats); // Log the updated stats here (after state update)
            return updatedStats;
        });
    }
};



export default parseResponse;
