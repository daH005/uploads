import { makeHtmlAttrNameSelector } from "./htmlAttrs.js";
var FileElAttrName;
(function (FileElAttrName) {
    FileElAttrName["FILENAME"] = "data-filename";
    FileElAttrName["FILE_URL"] = "data-url";
    FileElAttrName["FILE_DELETE"] = "data-delete";
})(FileElAttrName || (FileElAttrName = {}));
class AbstractInputFilesMapper {
    constructor(inputEl, filesEl, fileTempEl) {
        this._inputEl = inputEl;
        this._filesEl = filesEl;
        this._fileTempEl = fileTempEl;
        this._serverFilenames = new Set();
        this._serverFilenamesToDelete = new Set();
        this._fileEls = new Map();
        this._startInputEvent();
    }
    _startInputEvent() {
        this._inputEl.addEventListener("input", this._inputEventHandler.bind(this));
    }
    _inputEventHandler() {
        Array.from(this._inputEl.files).forEach((file) => {
            let url = this._makeUrlForFile(file);
            this._addFileEl(file.name, url);
        });
    }
    _makeUrlForFile(file) {
        return URL.createObjectURL(file);
    }
    _addFileEl(filename, url, isServerFile = false) {
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
            }
            else {
                this._deleteFile(filename);
            }
        });
        this._fileEls.set(filename, el);
    }
    _deleteServerFile(filename) {
        this._serverFilenames.delete(filename);
        this._serverFilenamesToDelete.add(filename);
    }
    addServerFile(filename, url) {
        this._addFileEl(filename, url, true);
        this._serverFilenames.add(filename);
    }
    getServerFilenamesToDelete() {
        return new Set(this._serverFilenamesToDelete);
    }
}
export class DefaultInputFilesMapper extends AbstractInputFilesMapper {
    _inputEventHandler() {
        this._serverFilenamesToDelete = new Set(this._serverFilenames);
        this._serverFilenames.clear();
        this._filesEl.innerHTML = "";
        super._inputEventHandler();
    }
    _deleteFile(filename) {
        this._inputEl.files = this._makeFilesWithoutDeleted(filename);
    }
    _makeFilesWithoutDeleted(filename) {
        let dataTransfer = new DataTransfer();
        Array.from(this._inputEl.files).forEach((file) => {
            if (file.name != filename) {
                dataTransfer.items.add(file);
            }
        });
        return dataTransfer.files;
    }
}
export class NoOverwriteInputFilesMapper extends AbstractInputFilesMapper {
    constructor(inputEl, filesEl, fileTempEl, storage) {
        super(inputEl, filesEl, fileTempEl);
        this._storage = storage;
    }
    _addFileEl(filename, url, isServerFile = false) {
        if (this._fileEls.has(filename)) {
            this._fileEls.get(filename).remove();
        }
        super._addFileEl(filename, url, isServerFile);
    }
    _deleteFile(filename) {
        this._storage.deleteFile(filename);
        this._storage.updateInput();
    }
}
