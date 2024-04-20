import { FilesStorage, FakeFileType } from "./storage.js";
import { makeHtmlAttrNameSelector, createEmptyFile, fileIsValidByAccept } from "./utils.js";
var ChildElAttrName;
(function (ChildElAttrName) {
    ChildElAttrName["INPUT"] = "data-input";
    ChildElAttrName["DRAG"] = "data-drag";
    ChildElAttrName["FILES"] = "data-files";
    ChildElAttrName["FILE_TEMPLATE"] = "data-file-template";
    ChildElAttrName["FILENAME"] = "data-filename";
    ChildElAttrName["FILE_URL"] = "data-url";
    ChildElAttrName["FILE_DELETE"] = "data-delete";
})(ChildElAttrName || (ChildElAttrName = {}));
export class FilesHTMLMapper {
    constructor(wrapElSelector) {
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
    _initChildEls() {
        this._inputEl = this._wrapEl.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.INPUT));
        this._dragEl = this._wrapEl.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.DRAG));
        this._filesContainerEl = this._wrapEl.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.FILES));
        this._fileTempEl = this._wrapEl.querySelector(makeHtmlAttrNameSelector(ChildElAttrName.FILE_TEMPLATE));
    }
    _initInputEvent() {
        this._inputEl.addEventListener("input", () => {
            this._handleNewFiles();
        });
    }
    _initDragEvents() {
        this._dragEl.addEventListener("drop", (event) => {
            event.preventDefault(); // stop opening file in other tab
            this._inputEl.files = event.dataTransfer.files;
            this._handleNewFiles();
        });
        this._dragEl.addEventListener("dragover", (event) => {
            event.preventDefault(); // stop opening file in other tab
        });
    }
    _handleNewFiles() {
        for (let i = 0; i < this._inputEl.files.length; i++) {
            this._curFile = this._inputEl.files[i];
            this._curUrl = URL.createObjectURL(this._curFile);
            this._handleCurFile();
        }
        this._updateInputFiles();
    }
    _handleCurFile() {
        if (!fileIsValidByAccept(this._curFile, this._accept)) {
            return;
        }
        if (!this._createdFilenames.has(this._curFile.name)) {
            this._createElForCurFile();
            this._createdFilenames.add(this._curFile.name);
        }
        this._storage.update(this._curFile);
    }
    _createElForCurFile() {
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
    _updateInputFiles() {
        this._inputEl.files = this._storage.prepareFileListForInput();
    }
    addFakeCommonFile(data) {
        this._curFile = createEmptyFile(data.name, FakeFileType.COMMON);
        this._curUrl = data.url;
        this._handleCurFile();
    }
}
