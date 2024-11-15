export class InputFilesStorage {

    protected _inputEl: HTMLInputElement;
    protected _map: Map<string, File>;

    public constructor(inputEl: HTMLInputElement) {
        this._inputEl = inputEl;
        this._map = new Map();
    }

    public addFile(file: File): void {
        this._map.set(file.name, file);
    }

    public deleteFile(filename: string): void {
        if (this._map.has(filename)) {
            this._map.delete(filename);
        }
    }

    public fileExist(filename: string): boolean {
        return this._map.has(filename);
    }

    public updateInput(): void {
        let dataTransfer: DataTransfer = new DataTransfer();
        this._map.forEach((file: File): void => {
            dataTransfer.items.add(file);
        });

        this._inputEl.files = dataTransfer.files;
    }

}
