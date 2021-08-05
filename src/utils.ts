export const _window: Window & { [key: string]: any } = window

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function expose(x: any, name?: string) {
    name = name || x.name
    if (!name) {
        throw new Error('No exposed name provided!')
    }
    _window[name] = x
}
