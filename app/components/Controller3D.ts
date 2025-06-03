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

    // Mapping of Gamepad API button indices to model mesh names (based on GLTF node names)
    private buttonMap: { [key: number]: string } = {
        0: 'Object_12',     // Assuming this corresponds to Croix (based on previous test)
        1: 'Object_36',    // Assuming this corresponds to Cercle
        2: 'Object_8',  // Assuming this corresponds to Triangle
        3: 'Object_10',    // Assuming this corresponds to Carré
        4: 'Object_13',        // Assuming this corresponds to L1
        5: 'Object_14',        // Assuming this corresponds to R1
        6: 'Object_17',        // Assuming this corresponds to L2
        7: 'Object_2',        // Assuming this corresponds to R2
        8: 'Object_20',
        16: 'Object_16',  // Assuming this corresponds to Share (or another button)
        17: 'Object_6',  // Assuming this corresponds to L2
        18: 'Object_18',  // Assuming this corresponds to R2
        19: 'Object_19',  // Assuming this corresponds to L3
        20: 'Object_20',  // Assuming this corresponds to R3
        21: 'Object_21',  // Assuming this corresponds to PS
        22: 'Object_22',  // Assuming this corresponds to Touchpad
        23: 'Object_23',  // Assuming this corresponds to Options
        // Indices 9 to 13 (Options, L3, R3, PS, Touchpad) are not mapped yet
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
            console.table(this.buttonMeshes);
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

        // Lecture des boutons manette
        const gamepads = navigator.getGamepads?.();
        if (gamepads?.[0]) {
            const gamepad = gamepads[0];
            const buttonValues = gamepad.buttons.map(b => b.value);
            this.updateButtonStates(buttonValues);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // New method to update button states
    public updateButtonStates(buttonValues: number[]) {
        // console.log('Button values:', buttonValues.map((val, i) => `${i}: ${val.toFixed(2)}`).join(', '));

        for (let i = 0; i < buttonValues.length; i++) {
            // Use a very low threshold for digital buttons and a slightly higher one for analog triggers
            const isAnalogTrigger = i === 6 || i === 7;
            const pressThreshold = isAnalogTrigger ? 0.1 : 0.01; // Threshold: 0.01 for digital, 0.1 for analog
            
            const buttonIsPressed = buttonValues[i] > pressThreshold;

            // Debug log
            if (buttonIsPressed) {
                console.log(`Button ${i} is pressed`);
            }

            const buttonMesh = this.buttonMeshes[i];
            const originalColor = this.originalEmissiveColors[i];

            if (buttonMesh && buttonMesh.material && originalColor !== undefined) {
                 // Handle multi-material case
                if (Array.isArray(buttonMesh.material)) {
                    buttonMesh.material.forEach(mat => {
                         // Check if material has emissive property and it's a Color
                         if ('emissive' in mat && mat.emissive instanceof THREE.Color) {
                             mat.emissive.set(buttonIsPressed ? 0x00ff00 : originalColor); // Green when pressed
                         }
                    });
                } else if ('emissive' in buttonMesh.material && buttonMesh.material.emissive instanceof THREE.Color) {
                     buttonMesh.material.emissive.set(buttonIsPressed ? 0x00ff00 : originalColor); // Green when pressed
                }
            } else if (buttonIsPressed) {
                 // Log if a button is pressed but mesh/material is not found/valid
                 // console.log(`Button ${i} pressed, but mesh or material/originalColor is missing/invalid.`);
            }
        }
    }
}