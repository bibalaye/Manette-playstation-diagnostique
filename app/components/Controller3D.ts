import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createScene, createCamera, createRenderer, addLighting, handleWindowResize } from '../utils/three';

export default class Controller3D {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private model!: THREE.Group;
    private controls: OrbitControls;
    private buttonMeshes: { [key: number]: THREE.Mesh | undefined } = {}; // To store references to button meshes
    private originalEmissiveColors: { [key: number]: THREE.Color | undefined } = {}; // To store original colors

    // Mapping of Gamepad API button indices to model mesh names
    private buttonMap: { [key: number]: string } = {
        0: 'button_cross',     // Cross
        1: 'button_circle',    // Circle
        2: 'button_triangle',  // Triangle
        3: 'button_square',    // Square
        4: 'button_l1',        // L1
        5: 'button_r1',        // R1
        6: 'button_l2',        // L2 (often an axis, but handled as button value)
        7: 'button_r2',        // R2 (often an axis, but handled as button value)
        8: 'button_share',     // Share
        9: 'button_options',   // Options
        10: 'button_l3',       // L3 (Left Stick Press)
        11: 'button_r3',       // R3 (Right Stick Press)
        12: 'button_ps',        // PS Button (may or may not exist/be named)
        13: 'button_touchpad' // Touchpad Button (may or may not exist/be named)
        // Add other buttons if needed, e.g., D-pad
    };

    constructor(container: HTMLElement) {
        this.scene = createScene();
        this.camera = createCamera();
        this.renderer = createRenderer();
        container.appendChild(this.renderer.domElement);

        addLighting(this.scene);
        handleWindowResize({ camera: this.camera, renderer: this.renderer });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI / 2;

        this.loadModel();
        this.animate();
    }

    private loadModel() {
        const loader = new GLTFLoader();
        loader.load('/models/ps4_controller/scene.gltf', (gltf) => {
            this.model = gltf.scene;
            this.scene.add(this.model);

            // Calculate bounding sphere to center controls and camera
            const boundingSphere = new THREE.Box3().setFromObject(this.model).getBoundingSphere(new THREE.Sphere());

            // Set controls target to the center of the model
            this.controls.target.copy(boundingSphere.center);

            // Adjust camera position based on the bounding sphere
            const distance = boundingSphere.radius * 2.5; // Adjust the multiplier as needed
            const cameraPosition = new THREE.Vector3();
            cameraPosition.copy(boundingSphere.center);
            cameraPosition.z += distance; // Position camera along the Z axis, adjust as needed
            // You might want to adjust the initial angle as well, e.g., adding to x or y
            // cameraPosition.x += distance * 0.5;
            // cameraPosition.y += distance * 0.3;
            this.camera.position.copy(cameraPosition);

            // Look for button meshes and store them
            for (const buttonIndex in this.buttonMap) {
                const meshName = this.buttonMap[buttonIndex];
                const mesh = this.model.getObjectByName(meshName) as THREE.Mesh;
                if (mesh) {
                    this.buttonMeshes[buttonIndex] = mesh;
                    // Store original emissive color (assuming a standard material with emissive)
                    if (mesh.material && ('emissive' in mesh.material)) {
                         // Check if material is an array
                        if (Array.isArray(mesh.material)) {
                            // Handle multi-material case, store color for each material
                            this.originalEmissiveColors[buttonIndex] = mesh.material.map(mat => 
                                ('emissive' in mat && mat.emissive instanceof THREE.Color) ? mat.emissive.clone() : undefined
                            ).find(color => color !== undefined); // Store the first valid color found
                        } else if (mesh.material.emissive instanceof THREE.Color) {
                             this.originalEmissiveColors[buttonIndex] = mesh.material.emissive.clone();
                        }
                    }
                }
            }

            // Ensure controls are updated with the new camera position and target
            this.controls.update();

        }, undefined, (error) => {
            console.error('An error occurred while loading the model:', error);
        });
    }

    private animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();

        this.renderer.render(this.scene, this.camera);
    }

    // New method to update button states
    public updateButtonStates(buttonValues: number[]) {
        for (let i = 0; i < buttonValues.length; i++) {
            const buttonIsPressed = buttonValues[i] > 0; // Use > 0 to handle analog buttons/triggers
            const buttonMesh = this.buttonMeshes[i];
            const originalColor = this.originalEmissiveColors[i];

            if (buttonMesh && buttonMesh.material) {
                 // Handle multi-material case
                if (Array.isArray(buttonMesh.material)) {
                    buttonMesh.material.forEach(mat => {
                         // Check if material has emissive property and it's a Color
                         if ('emissive' in mat && mat.emissive instanceof THREE.Color && originalColor) {
                            mat.emissive.set(buttonIsPressed ? 0x00ff00 : originalColor); // Green when pressed
                         }
                    });
                } else if ('emissive' in buttonMesh.material && buttonMesh.material.emissive instanceof THREE.Color && originalColor) {
                     buttonMesh.material.emissive.set(buttonIsPressed ? 0x00ff00 : originalColor); // Green when pressed
                }
            }
        }
    }
}