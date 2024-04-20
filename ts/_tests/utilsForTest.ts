import { FilesHTMLMapper, FakeCommonFileData } from "../mapper.js";
import { ACCEPT } from "./dataForTest.js";

export var inputEl: HTMLInputElement = document.querySelector("#uploader [data-input]");
inputEl.setAttribute("accept", ACCEPT)
var filesEl: HTMLElement = document.querySelector("#uploader [data-files]");

export var mapper = new FilesHTMLMapper("#uploader");

export function inputFakeFiles(data: FakeCommonFileData[]): void {
	for (let i in data) {
		mapper.addFakeCommonFile(data[i]);
	}
}

export function inputFiles(files: File[]): void {
	let event = new InputEvent("input");

	let dataTransfer = new DataTransfer();
	for (let i in files) {
		dataTransfer.items.add(files[i]);
	}
	
	inputEl.files = dataTransfer.files;
	inputEl.dispatchEvent(event);
}

export function deleteFiles(filenames: string[]): void {
	let child: Node;
	for (let i in filenames) {
		child = _getNodeByXpath(filesEl, `./div[contains(.,"${filenames[i]}")]//div[@data-delete]`);
		child.dispatchEvent(new MouseEvent("click"));
	}
}

function _getNodeByXpath(parentEl: HTMLElement, xpath: string): Node {
  return document.evaluate(xpath, parentEl, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}


export function checkFiles(filenamesAndtypes: Object): void {
	let expectedLength: number = Object.keys(filenamesAndtypes).length;
	let realLength: number = inputEl.files.length;
	if (expectedLength != realLength) {
		throw `Test failed by length: expected ${expectedLength} but got ${realLength}!`;
	}

	let curFile: File;
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
