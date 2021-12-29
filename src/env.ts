
export function requireEnvVariable(name: string | string[], defaultValue?: string): string {
    const names = Array.isArray(name) ? name : [name];

    for (let n of names) {
        const value = process.env[n];
        if (typeof value !== 'undefined') {
            return value;
        }
    }

    if (typeof defaultValue !== 'undefined') {
        return defaultValue;
    }

    throw new Error(`Env variable '${name}' is missing but required.`);
}
