const _INPUT_TYPES = {
    "string": "text",
    "number": "number",
};
export function makeArrayInputs(containerEl, name, array) {
    let type;
    for (let value of array) {
        type = _INPUT_TYPES[typeof value];
        value = String(value);
        containerEl.innerHTML += _makeInputElAsText(type, name, value);
    }
}
function _makeInputElAsText(type, name, value) {
    return `<input type="${type}" name="${name}" value="${value}">`;
}
