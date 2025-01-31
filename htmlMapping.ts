import { makeHtmlAttrNameSelector } from "./htmlAttrs.js";
import { InputFilesStorage } from "./storage.js";
import { noOverwriteFilesInInput } from "./noOverwrite.js";

enum FileElAttrName {
    FILENAME = "data-filename",
    FILE_IMAGE = "data-image",
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

        let filenameEl = el.querySelector(makeHtmlAttrNameSelector(FileElAttrName.FILENAME));
        if (filenameEl) {
            filenameEl.textContent = filename;
        }

        let urlEl = el.querySelector(makeHtmlAttrNameSelector(FileElAttrName.FILE_URL));
        if (urlEl) {
            urlEl.setAttribute("href", url);
        }

        let imageEl: HTMLImageElement = <HTMLImageElement>el.querySelector(makeHtmlAttrNameSelector(FileElAttrName.FILE_IMAGE));
        if (imageEl) {
            imageEl.setAttribute("src", url);
            imageEl.onerror = () => {
                imageEl.removeAttribute("src");
                imageEl.style.display = "none";
            }
        }

        let deleteEl = el.querySelector(makeHtmlAttrNameSelector(FileElAttrName.FILE_DELETE));
        if (deleteEl) {
            deleteEl.addEventListener("click", () => {
                el.remove();

                if (isServerFile) {
                    this._deleteServerFile(filename);
                } else {
                    this._deleteFile(filename);
                }

            });
        }

        this._fileEls.set(filename, el);
    }

    protected _deleteServerFile(filename: string): void {
        this._serverFilenames.delete(filename);
        this._serverFilenamesToDelete.add(filename);
    }

    protected abstract _deleteFile(filename: string): void;

    public addServerFile(filename: string, url: string): void {
        this._addFileEl(filename, url, true);
        this._serverFilenames.add(filename);
    }

    public getServerFilenamesToDelete(): string[] {
        return Array.from(new Set(this._serverFilenamesToDelete));
    }

    public clear(): void {
        this._serverFilenames.clear();
        this._serverFilenamesToDelete.clear();
        this._fileEls.clear();
        this._filesEl.innerHTML = "";
        this._inputEl.value = "";
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

    public constructor(inputEl: HTMLInputElement, filesEl: HTMLElement, fileTempEl: HTMLTemplateElement, storage: InputFilesStorage | null=null) {
        super(inputEl, filesEl, fileTempEl);

        if (!storage) {
            storage = new InputFilesStorage(inputEl);
        }
        this._storage = storage;
        noOverwriteFilesInInput(inputEl, storage);
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

    public clear(): void {
        super.clear();
        this._storage.clear();
    }

}
