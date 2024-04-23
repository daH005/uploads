import { makeHtmlAttrNameSelector } from "./htmlAttrs.js";
import { InputFilesStorage } from "./storage.js";

enum FileElAttrName {
    FILENAME = "data-filename",
    FILE_URL = "data-url",
    FILE_DELETE = "data-delete",
}

abstract class AbstractInputFilesMapper {

    protected _inputEl: HTMLInputElement;
    protected _filesEl: HTMLElement;
    protected _fileTempEl: HTMLTemplateElement;

    protected _serverFilenames: Set<string>;
    protected _serverFilenamesToDelete: Set<string>;
    protected _fileEls: Map<string, HTMLElement | Element>;

    public constructor(inputEl: HTMLInputElement, filesEl: HTMLElement, fileTempEl: HTMLTemplateElement) {
        this._inputEl = inputEl;
        this._filesEl = filesEl;
        this._fileTempEl = fileTempEl;

        this._serverFilenames = new Set();
        this._serverFilenamesToDelete = new Set();
        this._fileEls = new Map();

        this._startInputEvent();
    }

    protected _startInputEvent(): void {
        this._inputEl.addEventListener("input", this._inputEventHandler.bind(this));
    }

    protected _inputEventHandler(): void {
        Array.from(this._inputEl.files).forEach((file: File): void => {
            let url: string = this._makeUrlForFile(file);
            this._addFileEl(file.name, url);
        });
    }

    protected _makeUrlForFile(file: File): string {
        return URL.createObjectURL(file);
    }

    protected _addFileEl(filename: string, url: string, isServerFile: boolean=false): void {
        if (this._serverFilenames.has(filename)) {
            this._deleteServerFile(filename);
        }

        let node = this._fileTempEl.content.cloneNode(true);
        this._filesEl.append(node);

        let el = this._filesEl.lastElementChild;
        el.querySelector(makeHtmlAttrNameSelector(FileElAttrName.FILENAME)).textContent = filename;
        el.querySelector(makeHtmlAttrNameSelector(FileElAttrName.FILE_URL)).setAttribute("href", url);
        el.querySelector(makeHtmlAttrNameSelector(FileElAttrName.FILE_URL)).setAttribute("src", url);
        el.querySelector(makeHtmlAttrNameSelector(FileElAttrName.FILE_DELETE)).addEventListener("click", () => {
            el.remove();

            if (isServerFile) {
                this._deleteServerFile(filename);
            } else {
                this._deleteFile(filename);
            }

        });

        this._fileEls.set(filename, el);
    }

    protected _deleteServerFile(filename: string): void {
        this._serverFilenames.delete(filename);
        this._serverFilenamesToDelete.add(filename);
    }

    protected abstract _deleteFile(filename: string): void;

    protected addServerFile(filename: string, url: string): void {
        this._addFileEl(filename, url, true);
        this._serverFilenames.add(filename);
    }

    protected getServerFilenamesToDelete(): Set<string> {
        return new Set(this._serverFilenamesToDelete);
    }

}

export class DefaultInputFilesMapper extends AbstractInputFilesMapper {

    protected _inputEventHandler(): void {
        this._serverFilenamesToDelete = new Set(this._serverFilenames);
        this._serverFilenames.clear();

        this._filesEl.innerHTML = "";
        super._inputEventHandler();
    }

    protected _deleteFile(filename: string): void {
        this._inputEl.files = this._makeFilesWithoutDeleted(filename);
    }

    protected _makeFilesWithoutDeleted(filename: string): FileList {
        let dataTransfer: DataTransfer = new DataTransfer();

        Array.from(this._inputEl.files).forEach((file: File): void => {
            if (file.name != filename) {
                dataTransfer.items.add(file);
            }
        });

        return dataTransfer.files;
    }

}

export class NoOverwriteInputFilesMapper extends AbstractInputFilesMapper {

    protected _storage: InputFilesStorage;

    public constructor(inputEl: HTMLInputElement, filesEl: HTMLElement, fileTempEl: HTMLTemplateElement, storage: InputFilesStorage) {
        super(inputEl, filesEl, fileTempEl);
        this._storage = storage;
    }

    protected _addFileEl(filename: string, url: string, isServerFile: boolean=false): void {
        if (this._fileEls.has(filename)) {
            this._fileEls.get(filename).remove();
        }
        super._addFileEl(filename, url, isServerFile);
    }

    protected _deleteFile(filename: string): void {
        this._storage.deleteFile(filename);
        this._storage.updateInput();
    }

}
