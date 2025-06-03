'use client';

export default class GamepadAPI {
    private static instance: GamepadAPI;
    private currentGamepad: Gamepad | null = null;

    private constructor() {}

    public static getInstance(): GamepadAPI {
        if (!GamepadAPI.instance) {
            GamepadAPI.instance = new GamepadAPI();
        }
        return GamepadAPI.instance;
    }

    public detectController(): Gamepad | null {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.currentGamepad = gamepads[i];
                return gamepads[i];
            }
        }
        this.currentGamepad = null;
        return null;
    }

    public updateConnectionStatus() {
        const gamepad = this.detectController();
        if (gamepad) {
            return {
                connected: true,
                id: gamepad.id,
                buttons: gamepad.buttons.map(button => button.pressed),
                axes: gamepad.axes
            };
        } else {
            return {
                connected: false,
                id: null,
                buttons: [],
                axes: []
            };
        }
    }

    public getButtonValue(buttonIndex: number): number {
        const gamepad = this.currentGamepad || this.detectController();
        if (gamepad && gamepad.buttons[buttonIndex]) {
            return gamepad.buttons[buttonIndex].value;
        }
        return 0;
    }

    public getAxisValue(axisIndex: number): number {
        const gamepad = this.currentGamepad || this.detectController();
        if (gamepad && gamepad.axes[axisIndex] !== undefined) {
            return gamepad.axes[axisIndex];
        }
        return 0;
    }

    public getGamepad(): Gamepad | null {
        return this.currentGamepad || this.detectController();
    }
}

