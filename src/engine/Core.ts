import * as THREE from 'three'
import * as THREEx from 'ar-threex'
import Control from './Control'

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
    private _controls: Control[] = []

    get video(): HTMLVideoElement { return this._arSource.domElement }
    get width() { return this._renderer.domElement.width }
    get height() { return this._renderer.domElement.height }
    get aspect() { return this._aspect }
    get arCamera() { return this._arCamera }
    get mainScene() { return this._mainScene }
    get canvas() { return this._renderer.domElement }
    get container() { return this._container }

    constructor() {
        super()
        this._renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        })
        this._renderer.autoClear = false

        this._mainScene = new THREE.Scene()
        this._arCamera = new THREE.PerspectiveCamera()
        this._mainScene.add(this._arCamera)
    }

    init(params: InitParams) {
        // document.body.appendChild(this.renderer.domElement)
        addEventListener('resize', () => this.onResize())
        this._container = params.container
        this._container.style.position = 'relative'
        this._container.style.margin = '0 auto'
        this._container.appendChild(this._renderer.domElement)

        this._arProfile = new THREEx.ArToolkitProfile()
        this._arSource = new THREEx.ArToolkitSource(this._arProfile)
        this._arContext = new THREEx.ArToolkitContext(this._arProfile.contextParameters)

        this._arSource.init(() => {
            this._container.appendChild(this.video)
            this.video.addEventListener('loadedmetadata', () => {
                this._aspect = this.video.videoWidth / this.video.videoHeight
                this.onResize()
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
    }

    run() {
        let stop = false
        const stopListener = () => {
            stop = true
            this.removeEventListener('stop', stopListener)
        }
        this.addEventListener('stop', stopListener)
        const func = () => {
            if (!stop) {
                this.render()
                requestAnimationFrame(func)
            }
        }
        requestAnimationFrame(func)
    }

    stop() {
        this.dispatchEvent({ type: 'stop' })
    }

    addMarker(markerPath: string, object: THREE.Object3D) {
        new THREEx.ArMarkerControls(this._arContext, object, {
            type: 'pattern',
            patternUrl: markerPath
        })
        this._mainScene.add(object)
    }

    flipX() {
        this._container.style.transform = 'scaleX(-1)'
    }

    unflipX() {
        this._container.style.transform = 'scaleX(1)'
    }

    private onResize() {
        let width = 0
        let height = 0

        if (this._aspect > 1) {
            width = innerHeight * this._aspect
            height = innerHeight
        } else {
            width = innerWidth
            height = innerWidth / this._aspect
        }

        this._container.style.width = `${width}px`
        this._container.style.height = `${height}px`
        this._arCamera.aspect = this._aspect
        this._arCamera.updateProjectionMatrix()

        this.video.style.width = ''
        this.video.style.height = ''
        this.video.width = width
        this.video.height = height
        this._renderer.setSize(width, height)
        this._renderer.domElement.style.cssText = this.video.style.cssText
        this._renderer.domElement.style.zIndex = '-1'
    }

    private render() {
        if (this._arSource.ready) {
            this._arContext.update(this._arSource.domElement)
        }

        this.dispatchEvent({ type: 'render' })

        this._controls.forEach(x => x.update())

        this._renderer.clear()
        this._renderer.render(this._mainScene, this._arCamera)
    }
}

export default Core
