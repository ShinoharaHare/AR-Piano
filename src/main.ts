import * as THREE from 'three';
import { Core } from './core';
import { Hand } from './object/Hand';
import { Keyboard } from './object/Keyboard';
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

    const core = new Core({
        container: document.getElementById('container')!,
        arSourceParams: {
            sourceWidth: 640,
            sourceHeight: 480
        },
        arContextParams: {
            patternRatio: 0.9
        }
    });

    core.add(new THREE.AmbientLight(0x666666));
    core.add(new THREE.DirectionalLight(0xffffff, 0.5));

    let left = new Hand(Handedness.Left);
    left.rotation.x = Math.PI / 2;
    left.rotation.z = Math.PI;
    left.position.z = -3.0;
    left.position.y = -0.5;
    core.add(left);

    window.left = left;

    // let keyboard = new Keyboard();
    // keyboard.position.z = -3.0;
    // keyboard.position.y = -0.5;
    // keyboard.rotation.y = Math.PI / 2;
    // core.add(keyboard);


    const estimator = new MP3DEstimator();
    const smoother = new AngleSmoother();
    const angleData = new AngleData();

    tracker.track(core.arSourceVideo, results => {
        // let landmarks = results.multiHandLandmarks[0]
        // if (landmarks) {
        //     estimator.estimateAngles(landmarks, angleData);
        //     smoother.update(angleData);
        //     left.behavior.angleData.copy(smoother.smoothAngle);
        // }

        for (let i = 0; i < results.multiHandedness.length; i++) {
            let { label } = results.multiHandedness[i];
            let landmarks = results.multiHandLandmarks[i];

            if (label === 'Right') {
                estimator.estimateAngles(landmarks, angleData);
                // left.behavior.angleData.copy(angleData);
                smoother.update(angleData);
                left.behavior.angleData.copy(smoother.smoothAngle);
            } else {

            }
        }
    });

    // tracker.stop();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);

    core.addMarker('pattern/aruco-9-0.9.patt', cube);
    core.add(cube);

    core.start();
}

main();
