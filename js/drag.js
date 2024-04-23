import { fileIsValidByAccept } from "./accept.js";
export function addDragUploadingForInput(inputEl, dragEl) {
    let accept = inputEl.getAttribute("accept");
    dragEl.addEventListener("drop", (event) => {
        event.preventDefault(); // stop opening file in other tab
        let resultFiles = event.dataTransfer.files;
        if (accept) {
            resultFiles = _newDataTransferWithFilteredFilesByAccept(event.dataTransfer, accept).files;
        }
        inputEl.files = resultFiles;
        let inputEvent = new InputEvent("input");
        inputEl.dispatchEvent(inputEvent);
    });
    dragEl.addEventListener("dragover", (event) => {
        event.preventDefault(); // stop opening file in other tab
    });
}
function _newDataTransferWithFilteredFilesByAccept(dataTransfer, accept) {
    let resultDataTransfer = new DataTransfer();
    let file;
    for (let i = 0; i < dataTransfer.items.length; i++) {
        file = dataTransfer.items[i].getAsFile();
        if (fileIsValidByAccept(file, accept)) {
            resultDataTransfer.items.add(file);
        }
    }
    return resultDataTransfer;
}
