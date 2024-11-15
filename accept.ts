export function fileIsValidByAccept(file: File, accept: string): boolean {
    let isValid: boolean = false;

    let signs: string[] = accept.split(",");
    let curSign: string;
    for (let i in signs) {
        curSign = signs[i];
        
        if (curSign.startsWith(".")) {
            isValid = _filenameIsValidByExtension(file.name, curSign);
        } else {
            isValid = _fileTypeIsValidByRegex(file.type, new RegExp(curSign));
        }

        if (isValid) {
            break;
        }
    }

    return isValid;
}

function _filenameIsValidByExtension(filename: string, extension: string): boolean {
    return filename.endsWith(extension);
}

function _fileTypeIsValidByRegex(fileType: string, regex: RegExp): boolean {
    return Boolean(fileType.match(regex));
}
