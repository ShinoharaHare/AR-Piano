import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { Core } from './core';
import { Hand } from './object/Hand';
import { Keyboard } from './object/Keyboard';
import { KH } from './object/KH';
import { AngleSmoother, MP3DEstimator, MediaPipeTracker } from './tracking';
import { AngleData } from './tracking/AngleData';
import { Handedness } from './types';


async function main() {
    const tracker = new MediaPipeTracker(
        {
            maxNumHands: 2,
            minTrackingConfidence: 0.9,
            selfieMode: false
        },
        {
            locateFile: file => `mediapipe/${file}`
        }
    );

    const container = document.getElementById('container')!;

    const core = new Core({
        container,
        arSourceParams: {
            sourceWidth: 640,
            sourceHeight: 480
        },
        arContextParams: {
            patternRatio: 0.9
        },
        fullscreen: true,
    });
    window.core = core;

    core.add(new THREE.AmbientLight(0x666666));
    core.add(new THREE.DirectionalLight(0xffffff, 0.5));

    let kh = new KH();
    let anchor = new THREE.Object3D();
    core.addMarker({
        patternUrl: 'pattern/aruco-8-0.9.patt',
        smoothCount: 5,
        smoothTolerance: 0.08
    }, anchor);
    core.add(kh);

    const estimator = new MP3DEstimator();
    const smoother1 = new AngleSmoother(5, 0);
    smoother1.bind(kh.leftHand.behavior.angleData);
    const smoother2 = new AngleSmoother(5, 0);
    smoother2.bind(kh.rightHand.behavior.angleData);

    const angleData = new AngleData();

    tracker.track(core.arSourceVideo, results => {
        for (let i = 0; i < results.multiHandedness.length; i++) {
            let { label, score } = results.multiHandedness[i];
            let landmarks = results.multiHandLandmarks[i];
            estimator.update(landmarks);
            estimator.getAngles(angleData);

            let { x, y } = landmarks[0];
            if (label === 'Right') {
                kh.behavior.updateLeftHand(x * 2.5 - 1.25, y * 2 - 1);
                smoother1.update(angleData);
            } else if (label === 'Left') {
                kh.behavior.updateRightHand(x * 2.5 - 1.25, y * 2 - 1);
                smoother2.update(angleData);
            }
        }
    });

    // tracker.stop();

    let v1 = new THREE.Vector3();
    let v2 = new THREE.Vector3();
    let direction = new THREE.Vector3();
    window.s = 16
    core.addEventListener('update', () => {
        // kh.rotation.copy(anchor.rotation);
        // anchor.getWorldPosition(v1);
        // core.camera.getWorldPosition(v2);
        // direction.subVectors(v2, v1).normalize();

        // kh.position.copy(v1.add(direction.multiplyScalar(window.s)));

        core.renderer.clearDepth();
        core.renderer.setViewport(core.canvas.width - 300, core.canvas.height - 300, 300, 300);
        core.renderer.render(core.scene, kh.leftHandCamera);
    });

    core.start();
}

main();
