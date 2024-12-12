/**
 * Function to calculate the player's level based on experience points.
 * @param {number} experiencePoints - The current experience points of the player.
 * @returns {number} - The updated level of the player.
 */
const calculateLevel = (experiencePoints) => {
    // Each level requires 100 experience points
    let level = Math.floor(experiencePoints / 275);
    console.log("CalculateLevel experience points:", experiencePoints);
    console.log("CalculateLevel:", level);
    level = level <= 0 ? 1 : level;
    return level;
};

export default calculateLevel;
