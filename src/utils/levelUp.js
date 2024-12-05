/**
 * Function to calculate the player's level based on experience points.
 * @param {number} experiencePoints - The current experience points of the player.
 * @returns {number} - The updated level of the player.
 */
const calculateLevel = (experiencePoints) => {
    // Each level requires 500 experience points
    const level = Math.floor(experiencePoints / 500);
    return level;
};

export default calculateLevel;
