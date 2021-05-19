import { Results } from '@mediapipe/hands'

export interface IMediaPipeHands {
    infer(image: HTMLVideoElement): Promise<Results>
}

// class MediaPipeHands implements IMediaPipeHands {

 
// }
