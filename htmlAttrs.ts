export function makeHtmlAttrNameSelector(name: string): string {
    return "[" + name + "]";
}

export function makeHtmlAttrNameValueSelector(name: string, value: string): string {
    return "[" + name + "=" + "\"" + value + "\"" + "]";
}
