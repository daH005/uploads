import { InputFilesStorage } from "./storage.js";

export function noOverwriteFilesInInput(inputEl: HTMLInputElement, storage: InputFilesStorage): void {

    inputEl.addEventListener("input", (): void => {
        Array.from(inputEl.files).forEach((file: File): void => {
            storage.addFile(file);
        });
        storage.updateInput();
    });

}
