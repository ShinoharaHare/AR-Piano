export const _window: Window & { [key: string]: any } = window

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

