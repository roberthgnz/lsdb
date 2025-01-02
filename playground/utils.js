export function log(...args) {
    const output = document.getElementById('output');
    output.textContent = args
        .map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)
        .join('\n') + '\n\n' + output.textContent;
}