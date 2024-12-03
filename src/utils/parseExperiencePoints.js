const parseExperiencePoints = (responseText) => {
    const match = responseText.match(/(\d+)\s*experience points/i);
    return match ? parseInt(match[1], 10) : 0;
};


export default parseExperiencePoints;
