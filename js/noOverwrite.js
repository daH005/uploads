export function noOverwriteFilesInInput(inputEl, storage) {
    inputEl.addEventListener("input", () => {
        Array.from(inputEl.files).forEach((file) => {
            storage.addFile(file);
        });
        storage.updateInput();
    });
}
