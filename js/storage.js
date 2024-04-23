export class InputFilesStorage {
    constructor(inputEl) {
        this._inputEl = inputEl;
        this._map = new Map();
    }
    addFile(file) {
        this._map.set(file.name, file);
    }
    deleteFile(filename) {
        if (this._map.has(filename)) {
            this._map.delete(filename);
        }
    }
    fileExist(filename) {
        return this._map.has(filename);
    }
    updateInput() {
        let dataTransfer = new DataTransfer();
        this._map.forEach((file) => {
            dataTransfer.items.add(file);
        });
        this._inputEl.files = dataTransfer.files;
    }
}
