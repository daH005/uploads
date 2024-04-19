export function makeHtmlAttrNameSelector(name) {
    return "[" + name + "]";
}
export function makeHtmlAttrNameValueSelector(name, value) {
    return "[" + name + "=" + "\"" + value + "\"" + "]";
}
export function createEmptyFile(filename, type) {
    return new File(["content"], filename, { type: type });
}
