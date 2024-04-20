import { FilesHTMLMapper } from "../mapper.js";
import { ACCEPT } from "./dataForTest.js";
export var inputEl = document.querySelector("#uploader [data-input]");
inputEl.setAttribute("accept", ACCEPT);
var filesEl = document.querySelector("#uploader [data-files]");
export var mapper = new FilesHTMLMapper("#uploader");
export function inputFakeFiles(data) {
    for (let i in data) {
        mapper.addFakeCommonFile(data[i]);
    }
}
export function inputFiles(files) {
    let event = new InputEvent("input");
    let dataTransfer = new DataTransfer();
    for (let i in files) {
        dataTransfer.items.add(files[i]);
    }
    inputEl.files = dataTransfer.files;
    inputEl.dispatchEvent(event);
}
export function deleteFiles(filenames) {
    let child;
    for (let i in filenames) {
        child = _getNodeByXpath(filesEl, `./div[contains(.,"${filenames[i]}")]//div[@data-delete]`);
        child.dispatchEvent(new MouseEvent("click"));
    }
}
function _getNodeByXpath(parentEl, xpath) {
    return document.evaluate(xpath, parentEl, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
export function checkFiles(filenamesAndtypes) {
    let expectedLength = Object.keys(filenamesAndtypes).length;
    let realLength = inputEl.files.length;
    if (expectedLength != realLength) {
        throw `Test failed by length: expected ${expectedLength} but got ${realLength}!`;
    }
    let curFile;
    for (let i = 0; i < inputEl.files.length; i++) {
        curFile = inputEl.files[i];
        if (!(curFile.name in filenamesAndtypes)) {
            throw `Test failed by filename: ${curFile.name} filename not found!`;
        }
        if (filenamesAndtypes[curFile.name] != curFile.type) {
            throw `Test failed by file type: expected ${filenamesAndtypes[curFile.name]} but got ${curFile.type}!`;
        }
    }
}
