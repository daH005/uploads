import { createEmptyFile } from "./utils.js";

export enum FakeFileType {
    // all enum members must be in lower case for file.type
    COMMON = "fake_common",
    TO_DELETE = "fake_to_delete",
}

export class FilesStorage {

    private _files: Map<string, File>;
    private _curFile: File;

    public constructor() {
        this._files = new Map();
    }

    public update(file: File): void {
        this._files.set(file.name, file);
    }

    public delete(filename: string): void {
        this._curFile = this._files.get(filename);
        if (this._curFileAlreadyExistOnServer()) {
            this._files.set(filename, this._createFakeFileToDeleteOnServer());
        } else {
            this._files.delete(filename);
        }
    }

    public has(filename: string): boolean {
        return this._files.has(filename);
    }

    private _curFileAlreadyExistOnServer(): boolean {
        return this._curFile.type == FakeFileType.COMMON;
    }

    private _createFakeFileToDeleteOnServer(): File {
        return createEmptyFile(this._curFile.name, FakeFileType.TO_DELETE);
    }

    public prepareFileListForInput(): FileList {
        let transfer: DataTransfer = new DataTransfer();
        this._files.forEach((file: File): void => {
            this._curFile = file;
            if (!this._curFileAlreadyExistOnServer()) {
                transfer.items.add(file);
            }
        });
        
        return transfer.files;
    }

}
