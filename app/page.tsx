'use client';

import { useEffect, useRef, useState } from 'react';
import Controller3D from './components/Controller3D';
import ControllerButtons from './components/ControllerButtons';
import StatusDisplay from './components/StatusDisplay';
import GamepadAPI from './utils/gamepadAPI';

// Import potential new components for displaying stick/trigger state
import AnalogStickDisplay from './components/AnalogStickDisplay';
import TriggerDisplay from './components/TriggerDisplay';

export default function Page() {
    const containerRef = useRef<HTMLDivElement>(null);
    const controller3DRef = useRef<Controller3D | null>(null);
    const gamepadAPIRef = useRef<GamepadAPI | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [gamepadState, setGamepadState] = useState<any>(null);

    useEffect(() => {
        // Move function definitions outside of setTimeout
        const gamepadAPI = GamepadAPI.getInstance(); // gamepadAPI needs to be outside too if used in cleanup
        gamepadAPIRef.current = gamepadAPI; // Store here
        const container = containerRef.current;

        // Define updateStatus here to be accessible by cleanup
        const updateStatus = () => {
            const gamepad = gamepadAPI.getGamepad();
            // Check if statusDisplayRef is initialized before using
            // Assuming StatusDisplay can be accessed or its updateStatus method is exposed differently if needed
            // For now, assuming StatusDisplay instance is created and accessible if containerRef is current
             if (containerRef.current) { // Re-check if container is still mounted/valid
                 const statusDisplay = new StatusDisplay('status-display'); // Re-get or ensure persistent instance
                 statusDisplay.updateStatus(
                     gamepad?.connected || false, 
                     gamepad?.id || 'Unknown Controller'
                 );
             }
        };

        // Define startGamepadUpdateLoop here
        const startGamepadUpdateLoop = () => {
            const update = () => {
                const gamepad = gamepadAPI.getGamepad();
                if (gamepad) {
                    setGamepadState({ // Store relevant data
                         connected: gamepad.connected,
                         id: gamepad.id,
                         buttons: gamepad.buttons.map(b => b.value),
                         axes: [...gamepad.axes]
                    });
                    
                    if(controller3DRef.current) {
                         controller3DRef.current.updateButtonStates(gamepad.buttons.map(b => b.value));
                    }
                }
                requestAnimationFrame(update);
            };
            update();
        };

        // Define setupEventListeners here
        const setupEventListeners = () => {
            window.addEventListener('gamepadconnected', updateStatus);
            window.addEventListener('gamepaddisconnected', updateStatus);
        };

        // Add a slight delay before initializing Three.js and starting loops
        const initDelay = setTimeout(() => {
            if (!containerRef.current) return; // Final check before init
            
            // Three.js initialization and loop start
            if (!controller3DRef.current) { // Prevent re-initialization if component re-renders quickly
                 const controller3D = new Controller3D(containerRef.current);
                 controller3DRef.current = controller3D;
                 // Initial status display update
                 updateStatus();
            }

            setupEventListeners();
            startGamepadUpdateLoop();

        }, 100); // 100ms delay

        return () => {
            // Clear timeout and remove event listeners on component unmount
            clearTimeout(initDelay);
            window.removeEventListener('gamepadconnected', updateStatus);
            window.removeEventListener('gamepaddisconnected', updateStatus);
        };
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        // Main wrapper for potential ads
        <div className="flex flex-col w-full h-screen bg-gray-100">

            {/* Potential Top Ad Banner */}
            <div className="w-full h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-sm border-b border-gray-300">
                Publicité Potentielle Ici (728x90)
            </div>

            {/* Main content area (3D + Sidebar), adjusts based on fullscreen */}
            <div className={`flex flex-grow ${isFullscreen ? 'overflow-hidden' : ''}`}>

                {/* 3D View Column. Adjust classes based on isFullscreen state. */}
                <div 
                    ref={containerRef} 
                    className={`relative ${isFullscreen ? 'w-full h-screen' : 'w-full md:w-3/4 h-full'}`} // Adjusted h-full here
                >
                    {/* Fullscreen Toggle Button (using new class and icons) */}
                    <button 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="absolute top-4 right-4 fullscreen-toggle-button z-10"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {/* Fullscreen Icon */}
                        {isFullscreen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723V11m-5 1h2.553a1 1 0 01.915 1.408l-2.276 4.553a1 1 0 01-1.408.915l-4.553-2.276A1 1 0 019 15V13m-5 1h2.553a1 1 0 00.915-1.408l-2.276-4.553a1 1 0 00-1.408-.915l-4.553 2.276A1 1 0 003 9V11" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Controller Info Sidebar. Hide when in fullscreen mode. */}
                <div className={`w-full md:w-1/4 h-1/4 md:h-full bg-white p-4 flex flex-col items-center border-l border-gray-200 overflow-y-auto ${isFullscreen ? 'hidden' : 'flex'}`}>
                    <h2 className="text-xl font-bold mb-4">Manette Info</h2>
                    {/* Display Status */}
                    <div id="status-display" className="mb-4 text-base font-semibold text-center w-full" /> {/* Ensured full width */}
                    
                    {/* Display Analog Sticks State */}
                    {gamepadState?.axes && <AnalogStickDisplay axes={gamepadState.axes} />}

                    {/* Display Triggers State */}
                    {gamepadState?.buttons && <TriggerDisplay buttonValues={[gamepadState.buttons[6], gamepadState.buttons[7]]} />}

                    {/* Display Buttons */}
                    <ControllerButtons />

                    {/* Donate Button */}
                    <button className="donate-button mt-6">
                        Faire un don
                    </button>

                </div>

            </div>

            {/* Potential Bottom Ad Banner */}
            <div className="w-full h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-sm border-t border-gray-300">
                Autre Publicité Potentielle Ici (728x90)
            </div>

        </div>
    );
}