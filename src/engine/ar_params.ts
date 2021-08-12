const DefaultMarkerParams = {
    size: 1,
    type: 'pattern' as 'unknown' | 'barcode' | 'pattern',
    patternUrl: null as string | null,
    barcodeValue: null as string | null,
    changeMatrixMode: 'modelViewMatrix' as 'modelViewMatrix' | 'cameraTransformMatrix',
    smooth: true,
    smoothCount: 5,
    smoothTolerance: 0.01,
    smoothThreshold: 2
}

export type IMarkerParams = typeof DefaultMarkerParams

export function createMarkerParams(params: Partial<IMarkerParams>): IMarkerParams {
    return Object.assign({}, DefaultMarkerParams, params)
} 

