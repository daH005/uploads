import { createEmptyFile } from "./utils.js";
export var FakeFileType;
(function (FakeFileType) {
    // all enum members must be in lower case for file.type
    FakeFileType["COMMON"] = "fake_common";
    FakeFileType["TO_DELETE"] = "fake_to_delete";
})(FakeFileType || (FakeFileType = {}));
export class FilesStorage {
    constructor() {
        this._files = new Map();
    }
    update(file) {
        this._files.set(file.name, file);
    }
    delete(filename) {
        this._curFile = this._files.get(filename);
        if (this._curFileAlreadyExistOnServer()) {
            this._files.set(filename, this._createFakeFileToDeleteOnServer());
        }
        else {
            this._files.delete(filename);
        }
    }
    has(filename) {
        return this._files.has(filename);
    }
    _curFileAlreadyExistOnServer() {
        return this._curFile.type == FakeFileType.COMMON;
    }
    _createFakeFileToDeleteOnServer() {
        return createEmptyFile(this._curFile.name, FakeFileType.TO_DELETE);
    }
    prepareFileListForInput() {
        let transfer = new DataTransfer();
        this._files.forEach((file) => {
            this._curFile = file;
            if (!this._curFileAlreadyExistOnServer()) {
                transfer.items.add(file);
            }
        });
        return transfer.files;
    }
}
