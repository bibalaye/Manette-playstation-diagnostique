'use client';

import React from 'react';

interface AnalogStickDisplayProps {
    axes: number[]; // Array of axis values
}

const AnalogStickDisplay: React.FC<AnalogStickDisplayProps> = ({ axes }) => {
    // Assuming axes[0] and axes[1] are for Left Stick (X, Y)
    // Assuming axes[2] and axes[3] are for Right Stick (X, Y)

    const leftStickX = axes[0] || 0;
    const leftStickY = axes[1] || 0;
    const rightStickX = axes[2] || 0;
    const rightStickY = axes[3] || 0;

    // Map axis values (-1 to 1) to a visual representation (e.g., position of a dot)
    // This is a simplified visual representation, actual implementation might use SVG or canvas

    return (
        <div className="analog-sticks-display mb-4 w-full">
            <h3 className="text-center font-semibold mb-2">Analog Sticks</h3>
            <div className="flex justify-around">
                {/* Left Stick */}
                <div className="stick-container relative w-20 h-20 border border-gray-300 rounded-full flex items-center justify-center bg-gray-200">
                    <div 
                        className="stick-dot absolute w-4 h-4 bg-blue-500 rounded-full"
                        style={{ 
                            transform: `translate(${leftStickX * 25}px, ${leftStickY * 25}px)` // Adjust multiplier for visual range
                        }}
                    />
                </div>
                {/* Right Stick */}
                 <div className="stick-container relative w-20 h-20 border border-gray-300 rounded-full flex items-center justify-center bg-gray-200">
                    <div 
                        className="stick-dot absolute w-4 h-4 bg-red-500 rounded-full"
                         style={{ 
                            transform: `translate(${rightStickX * 25}px, ${rightStickY * 25}px)` // Adjust multiplier for visual range
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AnalogStickDisplay; 