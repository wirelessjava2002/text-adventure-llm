import React, { useState } from 'react';

const Inventory = () => {
    const [items, setItems] = useState([
        { name: "Sword", quantity: 1 },
        { name: "Rations", quantity: 5 },
    ]);

    const addItem = (itemName) => {
        const existingItem = items.find(item => item.name === itemName);
        if (existingItem) {
            setItems(items.map(item => 
                item.name === itemName ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setItems([...items, { name: itemName, quantity: 1 }]);
        }
    };

    return (
        <div className="inventory">
            <h3>Inventory</h3>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>
                        {item.name} (x{item.quantity})
                    </li>
                ))}
            </ul>
            <button onClick={() => addItem("Potion")} className="add-item-button">Add Potion</button>
        </div>
    );
};

export default Inventory;
