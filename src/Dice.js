import React from 'react';
import { motion } from 'framer-motion';

const Dice = ({ value }) => {
    return (
        <motion.div
            className="dice"
            animate={{ rotate: [0, 360], scale: [1, 1.5, 1] }}
            transition={{ duration: 0.5 }}
            style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
            }}
        >
            {value}
        </motion.div>
    );
};

export default Dice;
