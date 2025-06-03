'use client';

import React from 'react';

interface TriggerDisplayProps {
    buttonValues: number[]; // Array containing values for L2 and R2 (indices 6 and 7)
}

const TriggerDisplay: React.FC<TriggerDisplayProps> = ({ buttonValues }) => {
    // Assuming buttonValues[0] is for L2 and buttonValues[1] is for R2
    const l2Value = buttonValues[0] || 0;
    const r2Value = buttonValues[1] || 0;

    // Map button values (0 to 1) to a visual representation (e.g., height of a bar)

    return (
        <div className="triggers-display mb-4 w-full">
             <h3 className="text-center font-semibold mb-2">Gâchettes</h3>
            <div className="flex justify-around items-end h-16">
                {/* L2 Trigger */}
                <div className="trigger-bar-container w-8 h-full bg-gray-300 rounded-md overflow-hidden">
                    <div 
                        className="trigger-bar w-full bg-blue-500"
                         style={{ 
                            height: `${l2Value * 100}%` // Height based on value (0 to 1)
                         }}
                    />
                </div>
                {/* R2 Trigger */}
                <div className="trigger-bar-container w-8 h-full bg-gray-300 rounded-md overflow-hidden">
                    <div 
                        className="trigger-bar w-full bg-red-500"
                         style={{ 
                            height: `${r2Value * 100}%` // Height based on value (0 to 1)
                         }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TriggerDisplay; 