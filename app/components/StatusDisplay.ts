'use client';

export default class StatusDisplay {
    private statusElement: HTMLElement;

    constructor(statusElementId: string) {
        const element = document.getElementById(statusElementId);
        if (!element) {
            throw new Error(`Element with id ${statusElementId} not found`);
        }
        this.statusElement = element;
    }

    public updateStatus(isConnected: boolean, controllerId: string): void {
        if (this.statusElement) {
            if (isConnected) {
                this.statusElement.textContent = `✅ ${controllerId} connectée`;
                this.statusElement.className = 'status connected';
            } else {
                this.statusElement.textContent = '❌ Connectez votre manette PS4 (USB ou Bluetooth)';
                this.statusElement.className = 'status disconnected';
            }
        }
    }
}