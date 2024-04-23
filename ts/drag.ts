import { fileIsValidByAccept } from "./accept.js";

export function addDragUploadingForInput(inputEl: HTMLInputElement, dragEl: HTMLElement): void {

    let accept: string | null = inputEl.getAttribute("accept");
    dragEl.addEventListener("drop", (event: DragEvent): void => {
        event.preventDefault();  // stop opening file in other tab

        let resultFiles: FileList = event.dataTransfer.files;
        if (accept) {
            resultFiles = _newDataTransferWithFilteredFilesByAccept(event.dataTransfer, accept).files;
        }
        inputEl.files = resultFiles;

        let inputEvent: InputEvent = new InputEvent("input");
        inputEl.dispatchEvent(inputEvent)
    });

    dragEl.addEventListener("dragover", (event: DragEvent): void => {
        event.preventDefault();  // stop opening file in other tab
    });

}

function _newDataTransferWithFilteredFilesByAccept(dataTransfer: DataTransfer, accept: string): DataTransfer {
    let resultDataTransfer: DataTransfer = new DataTransfer();

    let file: File;
    for(let i = 0; i < dataTransfer.items.length; i++) {
        file = dataTransfer.items[i].getAsFile();
        if (fileIsValidByAccept(file, accept)) {
            resultDataTransfer.items.add(file);
        }
    }

    return resultDataTransfer;
}
