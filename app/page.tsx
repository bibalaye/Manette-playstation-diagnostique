'use client';

import { useEffect, useRef } from 'react';
import Controller3D from './components/Controller3D';
import ControllerButtons from './components/ControllerButtons';
import StatusDisplay from './components/StatusDisplay';
import GamepadAPI from './utils/gamepadAPI';

export default function Page() {
    const containerRef = useRef<HTMLDivElement>(null);
    const controller3DRef = useRef<Controller3D | null>(null);
    const gamepadAPIRef = useRef<GamepadAPI | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const gamepadAPI = GamepadAPI.getInstance();
        gamepadAPIRef.current = gamepadAPI; // Store gamepadAPI instance
        const container = containerRef.current;
        
        const controller3D = new Controller3D(container);
        controller3DRef.current = controller3D; // Store controller3D instance
        const statusDisplay = new StatusDisplay('status-display');

        const updateStatus = () => {
            const gamepad = gamepadAPI.getGamepad();
            statusDisplay.updateStatus(
                gamepad?.connected || false, 
                gamepad?.id || 'Unknown Controller'
            );
        };

        const setupEventListeners = () => {
            window.addEventListener('gamepadconnected', updateStatus);
            window.addEventListener('gamepaddisconnected', updateStatus);
        };

        const startGamepadUpdateLoop = () => {
            const update = () => {
                const gamepad = gamepadAPI.getGamepad();
                if (gamepad && controller3DRef.current) {
                    // Pass button states to Controller3D
                    const buttonStates = gamepad.buttons.map(button => button.value);
                    controller3DRef.current.updateButtonStates(buttonStates); // Call new method in Controller3D
                }
                requestAnimationFrame(update);
            };
            update();
        };

        setupEventListeners();
        startGamepadUpdateLoop(); // Start the gamepad update loop

        return () => {
            window.removeEventListener('gamepadconnected', updateStatus);
            window.removeEventListener('gamepaddisconnected', updateStatus);
        };
    }, []);

    return (
        <div className="full-screen-container">
            <div ref={containerRef} className="w-full h-full" />
            <div id="status-display" />
            <ControllerButtons />
        </div>
    );
}