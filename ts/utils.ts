export function makeHtmlAttrNameSelector(name: string): string {
    return "[" + name + "]";
}

export function makeHtmlAttrNameValueSelector(name: string, value: string): string {
    return "[" + name + "=" + "\"" + value + "\"" + "]";
}

export function createEmptyFile(filename: string, type: string): File {
    return new File(["content"], filename, {type: type});
}
