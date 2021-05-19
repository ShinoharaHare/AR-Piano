import * as THREE from 'three'
import * as THREEx from 'ar-threex'

export interface InitParams {
    container: HTMLElement

}

export class Core {
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    private container!: HTMLElement
    private arProfile: any = null
    private arSource: any = null
    private arContext: any = null
    private aspect!: number
    private stopRendering: boolean = false
    
    get video(): HTMLVideoElement { return this.arSource.domElement }
    get width() { return this.renderer.domElement.width }
    get height() { return this.renderer.domElement.height }

    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        })
        this.renderer.autoClear = false

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera()

        this.scene.add(this.camera)
    }

    init(params: InitParams) {
        // document.body.appendChild(this.renderer.domElement)
        this.container = params.container
        this.container.appendChild(this.renderer.domElement)

        this.arProfile = new THREEx.ArToolkitProfile()
        this.arSource = new THREEx.ArToolkitSource(this.arProfile)
        this.arContext = new THREEx.ArToolkitContext(this.arProfile.contextParameters)

        this.arSource.init(() => {
            this.container.appendChild(this.video)
            this.video.addEventListener('loadedmetadata', () => {
                this.aspect = this.video.videoWidth / this.video.videoHeight
                this.onResize()
            })
        })

        this.arContext.init(() => {
            applyProjectionMatrix(this.camera, this.arContext.getProjectionMatrix())
        })
    }

    private onResize() {
        const width = innerHeight * this.aspect
        const height = innerHeight

        this.container.style.width = `${width}px`
        this.container.style.height = `${height}px`

        this.video.style.width = ''
        this.video.style.height = ''
        this.video.width = width
        this.video.height = height
        // this.camera.aspect = this.aspect
        // this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
        this.renderer.domElement.style.cssText = this.video.style.cssText
        this.renderer.domElement.style.zIndex = '-1'
    }

    private render() {
        if (this.arSource.ready) {
            this.arContext.update(this.arSource.domElement)
        }

        this.renderer.clear()
        this.renderer.render(this.scene, this.camera)
    }

    addMarker(markerPath: string, object: THREE.Object3D) {
        new THREEx.ArMarkerControls(this.arContext, object, {
            type: 'pattern',
            patternUrl: markerPath
        })
        this.scene.add(object)
    }

    run() {
        var geometry = new THREE.BoxGeometry(1, 1, 1)
        var material = new THREE.MeshPhongMaterial()
        var mesh = new THREE.Mesh(geometry, material)
        this.addMarker('pattern-marker.patt', mesh)
        const tmp = () => {
            if (this.stopRendering) {
                this.stopRendering = false
                return
            }
            this.render()
            requestAnimationFrame(tmp)
        }
        requestAnimationFrame(tmp)
    }

    stop() {
        this.stopRendering = true
    }
}

function applyProjectionMatrix(camera: THREE.PerspectiveCamera, projectionMatrix: THREE.Matrix4) {
    camera.aspect = projectionMatrix.elements[5] / projectionMatrix.elements[0]
    camera.fov = 2.0 * Math.atan(1.0 / projectionMatrix.elements[5]) * 180.0 / Math.PI
    camera.near = projectionMatrix.elements[14] / (projectionMatrix.elements[10] - 1.0)
    camera.far = projectionMatrix.elements[14] / (projectionMatrix.elements[10] + 1.0)
    camera.updateProjectionMatrix()
    // camera.projectionMatrix.copy(projectionMatrix)
}
