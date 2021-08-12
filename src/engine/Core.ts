import * as THREE from 'three'
import * as THREEx from 'ar-threex'
import BaseObject from './BaseObject'


export interface InitParams {
    container: HTMLElement
}

class Core extends THREE.EventDispatcher {
    private _renderer: THREE.WebGLRenderer
    private _mainScene: THREE.Scene
    private _arCamera: THREE.PerspectiveCamera

    private _container!: HTMLElement
    private _arProfile: any = null
    private _arSource: any = null
    private _arContext: any = null
    private _aspect!: number
    private _running: boolean = false
    private _clock: THREE.Clock = new THREE.Clock()
    private _fullscreen: boolean = false

    get fullscreen() { return this._fullscreen }
    set fullscreen(x: boolean) {
        this._fullscreen = x
        this.resize(window.innerWidth, window.innerHeight)
    }

    get video(): HTMLVideoElement { return this._arSource.domElement }
    get width() { return this._renderer.domElement.width }
    get height() { return this._renderer.domElement.height }
    get aspect() { return this._aspect }
    get arCamera() { return this._arCamera }
    get mainScene() { return this._mainScene }
    get domElement() { return this._renderer.domElement }
    get container() { return this._container }
    get running() { return this._running }

    public constructor() {
        super()
        this._renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        })
        this._renderer.setPixelRatio(window.devicePixelRatio)
        this._renderer.autoClear = false

        this._mainScene = new THREE.Scene()
        this._arCamera = new THREE.PerspectiveCamera()
        this._mainScene.add(this._arCamera)
    }

    public init(params: InitParams) {
        this._container = params.container
        this._container.style.display = 'flex'
        this._container.style.alignItems = 'center'
        this._container.style.justifyContent = 'center'
        this._container.style.width = '100vw'
        this._container.style.height = '100vh'

        this._container.appendChild(this._renderer.domElement)

        this._arProfile = new THREEx.ArToolkitProfile()
        this._arProfile.contextParameters.cameraParametersUrl = 'camera_para.dat'

        let n = 2
        let w = 320 * n
        let h = 240 * n
        this._arProfile.sourceParameters = {
            sourceType: 'webcam',
            sourceWidth: w,
            sourceHeight: h,
            displayWidth: w,
            displayHeight: h
        }

        this._arSource = new THREEx.ArToolkitSource(this._arProfile.sourceParameters)
        this._arContext = new THREEx.ArToolkitContext(this._arProfile.contextParameters)

        this._arSource.init(() => {
            this._container.appendChild(this.video)
            this.video.addEventListener('loadedmetadata', () => {
                this._aspect = this.video.videoWidth / this.video.videoHeight
                this._arCamera.aspect = this._aspect
                this._arCamera.updateProjectionMatrix()
                this.resize(window.innerWidth, window.innerHeight)
            })
        })

        this._arContext.init(() => {
            const matrix = this._arContext.getProjectionMatrix()
            // this._arCamera.aspect = matrix.elements[5] / matrix.elements[0]
            this._arCamera.fov = 2.0 * Math.atan(1.0 / matrix.elements[5]) * 180.0 / Math.PI
            this._arCamera.near = matrix.elements[14] / (matrix.elements[10] - 1.0)
            this._arCamera.far = matrix.elements[14] / (matrix.elements[10] + 1.0)
            this._arCamera.updateProjectionMatrix()
        })

        window.addEventListener('resize', () => this.resize(window.innerWidth, window.innerHeight))
    }

    public run() {
        if (!this._running) {
            this._mainScene.traverse(obj => {
                if (obj instanceof BaseObject) {
                    obj.setup()
                }
            })
            this._renderer.setAnimationLoop(() => this._render())
        }
    }

    public stop() {
        this._renderer.setAnimationLoop(null)
        this.dispatchEvent({ type: 'stop' })
    }

    public add(obj: THREE.Object3D) {
        this._mainScene.add(obj)
    }

    public addMarker(markerPath: string, object: THREE.Object3D) {
        let controls = new THREEx.ArMarkerControls(this._arContext, object, {
            type: 'pattern',
            patternUrl: markerPath
        })
        this._mainScene.add(object)
        return controls
    }

    public flipX() {
        this._container.style.transform = 'scaleX(-1)'
    }

    public unflipX() {
        this._container.style.transform = 'scaleX(1)'
    }

    public resize(width: number, height: number) {
        this.video.style.cssText = ''
        this.video.style.position = 'absolute'
        this.video.style.zIndex = '-2'

        if (this._fullscreen) {
            this._container.style.position = 'fixed'

            this._arSource.onResizeElement()
            this._arSource.copyElementSizeTo(this._renderer.domElement)
            this._arSource.copyElementSizeTo(this._arContext.arController.canvas)

            width = parseInt(this._renderer.domElement.style.width)
            height = parseInt(this._renderer.domElement.style.height)
        } else {
            this._container.style.position = 'relative'

            let w = height * this._aspect
            if (w <= width) {
                width = height * this._aspect
            } else {
                height = width / this._aspect
            }

            this._renderer.domElement.style.margin = '0'

            this.video.style.left = '50%'
            this.video.style.top = '50%'
            this.video.style.transform = 'translate(-50%, -50%)'
            this.video.width = width
            this.video.height = height
        }

        this._renderer.setSize(width, height)
    }

    private _render() {
        if (this._arSource.ready) {
            this._arContext.update(this._arSource.domElement)
        }

        this._mainScene.traverse(obj => {
            if (obj instanceof BaseObject) {
                obj.update(this._arCamera)
            }
        })
        this.dispatchEvent({ type: 'render', delta: this._clock.getDelta() })

        this._renderer.clear()
        this._renderer.render(this._mainScene, this._arCamera)
    }
}

export default Core
