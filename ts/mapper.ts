import { FilesStorage, FakeFileType } from "./storage.js";
import { makeHtmlAttrNameSelector, createEmptyFile, fileIsValidByAccept } from "./utils.js";

interface FakeCommonFileData {
    name: string,
    url: string,
}

enum ChildElAttrName {
    INPUT = "data-input",
    DRAG = "data-drag",
    FILES = "data-files",
    FILE_TEMPLATE = "data-file-template",
    FILENAME = "data-filename",
    FILE_URL = "data-url",
    FILE_DELETE = "data-delete",
}

export class FilesHTMLMapper {

    private _wrapEl: HTMLElement;
    private _inputEl: HTMLInputElement;
    private _dragEl?: HTMLElement;
    private _filesContainerEl: HTMLElement;
    private _fileTempEl: HTMLTemplateElement;
    private _accept: string;

    private _storage: FilesStorage;
    private _createdFilenames: Set<string>;

    private _curFile: File;
    private _curUrl: string;

    public constructor(wrapElSelector: string) {
        this._wrapEl = document.querySelector(wrapElSelector);
        this._initChildEls();
        this._accept = this._inputEl.getAttribute("accept");

        this._initInputEvent();
        if (this._dragEl) {
            this._initDragEvents();
        }

        this._storage = new FilesStorage();
        this._createdFilenames = new Set();
    }

    private _initChildEls(): void {
        this._inputEl = this._wrapEl.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.INPUT));
        this._dragEl = this._wrapEl.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.DRAG));
        this._filesContainerEl = this._wrapEl.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.FILES));
        this._fileTempEl = this._wrapEl.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.FILE_TEMPLATE));
    }

    private _initInputEvent(): void {
        this._inputEl.addEventListener("input", (): void => {
            this._handleNewFiles();
        });
    }

    private _initDragEvents(): void {
        this._dragEl.addEventListener("drop", (event: DragEvent): void => {
            event.preventDefault();  // stop opening file in other tab
            this._inputEl.files = event.dataTransfer.files;
            this._handleNewFiles();
        });

        this._dragEl.addEventListener("dragover", (event: DragEvent): void => {
            event.preventDefault();  // stop opening file in other tab
        });
    }

    private _handleNewFiles(): void {
        for (let i = 0; i < this._inputEl.files.length; i++) {
            this._curFile = this._inputEl.files[i];
            this._curUrl = URL.createObjectURL(this._curFile);
            this._handleCurFile();
        }
        this._updateInputFiles();
    }

    private _handleCurFile(): void {
        if (!fileIsValidByAccept(this._curFile, this._accept)) {
            return;
        }

        if (!this._createdFilenames.has(this._curFile.name)) {
            this._createElForCurFile();
            this._createdFilenames.add(this._curFile.name);
        }
        this._storage.update(this._curFile);
    }

    private _createElForCurFile(): void {
        let filename = this._curFile.name;

        let node = this._fileTempEl.content.cloneNode(true);
        this._filesContainerEl.append(node);

        let el = this._filesContainerEl.lastElementChild;
        el.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.FILENAME)).textContent = this._curFile.name;
        el.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.FILE_URL)).setAttribute("href", this._curUrl);
        el.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.FILE_DELETE)).addEventListener("click", () => {
            el.remove();
            this._createdFilenames.delete(filename);
            this._storage.delete(filename);
            this._updateInputFiles();
        });
    }

    private _updateInputFiles(): void {
        this._inputEl.files = this._storage.prepareFileListForInput();
    }

    public addFakeCommonFile(data: FakeCommonFileData): void {
        this._curFile = createEmptyFile(data.name, FakeFileType.COMMON);
        this._curUrl = data.url;
        this._handleCurFile();
    }

}
