const _INPUT_TYPES = {
    "string": "text",
    "number": "number",
}

export function makeArrayInputs(containerEl: HTMLElement, name: string, array: Array<string | number>): void {
    let type: string;
    for (let value of array) {
        type = _INPUT_TYPES[typeof value];
        value = String(value);
        containerEl.innerHTML += _makeInputElAsText(type, name, value);
    }
}

function _makeInputElAsText(type: string, name: string, value: string): string {
    return `<input type="${type}" name="${name}" value="${value}">`;
}
