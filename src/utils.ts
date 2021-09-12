export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function expose(name: string, value: any) {
    window[name] = value;
}
