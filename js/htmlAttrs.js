export function makeHtmlAttrNameSelector(name) {
    return "[" + name + "]";
}
export function makeHtmlAttrNameValueSelector(name, value) {
    return "[" + name + "=" + "\"" + value + "\"" + "]";
}
