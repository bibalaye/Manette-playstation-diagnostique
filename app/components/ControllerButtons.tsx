// ControllerButtons.tsx
'use client';

import React from 'react';

export default class ControllerButtons extends React.Component {
    private handleButtonPress = (buttonId: string) => {
        console.log(`${buttonId} pressed`);
    };

    render() {
        return (
            <div className="button-grid">
                <button className="test-button" id="btn-1" onClick={() => this.handleButtonPress('Circle')}>○</button>
                <button className="test-button" id="btn-2" onClick={() => this.handleButtonPress('Square')}>□</button>
                <button className="test-button" id="btn-3" onClick={() => this.handleButtonPress('Triangle')}>△</button>
                <button className="test-button" id="btn-0" onClick={() => this.handleButtonPress('Cross')}>✕</button>
                <button className="test-button" id="btn-4" onClick={() => this.handleButtonPress('L1')}>L1</button>
                <button className="test-button" id="btn-5" onClick={() => this.handleButtonPress('R1')}>R1</button>
                <button className="test-button" id="btn-6" onClick={() => this.handleButtonPress('L2')}>L2</button>
                <button className="test-button" id="btn-7" onClick={() => this.handleButtonPress('R2')}>R2</button>
                <button className="test-button" id="btn-8" onClick={() => this.handleButtonPress('Share')}>Share</button>
                <button className="test-button" id="btn-9" onClick={() => this.handleButtonPress('Options')}>Options</button>
                <button className="test-button" id="btn-10" onClick={() => this.handleButtonPress('L3')}>L3</button>
                <button className="test-button" id="btn-11" onClick={() => this.handleButtonPress('R3')}>R3</button>
                <button className="test-button" id="btn-12" onClick={() => this.handleButtonPress('Touchpad')}>Touch</button>
            </div>
        );
    }
}



