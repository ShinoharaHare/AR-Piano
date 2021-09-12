import * as THREE from 'three';
import { Core } from './core';
import { Hand } from './object/Hand';
import { AngleSmoother, MP3DEstimator, MediaPipeTracker } from './tracking';
import { AngleData } from './tracking/AngleData';
import { Handedness } from './types';


async function main() {
    const tracker = new MediaPipeTracker(
        {
            maxNumHands: 1,
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
    
    core.add(new THREE.AmbientLight(0xffffff));

    let left = new Hand(Handedness.Left);
    left.rotation.x = Math.PI / 2;
    left.rotation.z = Math.PI;
    left.position.z = -3.0;
    left.position.y = -0.5;

    core.add(left);

    const estimator = new MP3DEstimator();
    const smoother = new AngleSmoother(5, 2 * Math.PI / 180);
    const angleData = new AngleData();

    tracker.track(core.arSourceVideo, results => {
        let landmarks = results.multiHandLandmarks[0]
        if (landmarks) {
            estimator.estimateAngles(landmarks, angleData);
            smoother.update(angleData);
            left.behavior.angleData.copy(smoother.smoothAngle);
        }
    });

    // tracker.stop();

    core.start();
}

main();
