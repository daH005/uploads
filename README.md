## Few words about this project
`HTMLUploadingUtils` - is set of JS(TS)-modules for HTML deciding the following problems:
- Uploading files in parts (without overwriting files with each new selection)
- Mapping uploaded files in HTML
- Deleting uploaded files with HTML
- Drag-and-drop uploading

I took care of:
- Mapping and deleting files that already exist on the server
- Validation of files by `accept` attribute of `input` element (by default it does not work for drag-and-drop)

## Usage
### 1. Drag-and-drop uploading:
HTML:
```html
<input type="file" multiple data-input>
<div data-drag>Drag</div>
```
JS:
```js
import { addDragUploadingForInput } from "./js/drag.js";

var inputEl = document.querySelector("[data-input]");
var dragEl = document.querySelector("[data-drag]");

addDragUploadingForInput(inputEl, dragEl);
```

### 2. Uploading by multiple parts without overwriting files with each new selection:
HTML:
```html
<input type="file" multiple data-input>
```
JS:
```js
import { InputFilesStorage } from "./js/storage.js";
import { noOverwriteFilesInInput } from "./js/noOverwrite.js";

var inputEl = document.querySelector("[data-input]");
var storage = new InputFilesStorage(inputEl);

noOverwriteFilesInInput(inputEl, storage);
```

### 3. Mapping files in HTML:
### 3.1. Default input with overwriting:
HTML:
```html
<input type="file" multiple data-input>

<div data-files></div>

<template data-file-template>
    <div class="file">
        <div data-filename></div>
        <a target="_blank" data-url>Url</a>
        <div data-delete>Delete</div>
    </div>
</template>
```
JS:
```js
import { DefaultInputFilesMapper } from "./js/htmlMapping.js";

var inputEl = document.querySelector("[data-input]");
var filesEl = document.querySelector("[data-files]");
var fileTempEl = document.querySelector("[data-file-template]");

var mapper = new DefaultInputFilesMapper(inputEl, filesEl, fileTempEl);
```

### 3.2. Input without overwriting:
```js
import { NoOverwriteInputFilesMapper } from "./js/htmlMapping.js";
import { InputFilesStorage } from "./js/storage.js";
import { noOverwriteFilesInInput } from "./js/noOverwrite.js";

...
var storage = new InputFilesStorage(inputEl);

noOverwriteFilesInInput(inputEl, storage);
var mapper = new NoOverwriteInputFilesMapper(inputEl, filesEl, fileTempEl, storage);
```

### 3.3. You can add files that already exist on the server:
```js
...
mapper.addServerFile("filename.extenstion", "https://url.com");
mapper.addServerFile("filename.extenstion", "https://url.com");
...
```

### 3.4. You can get files to delete on the server:
```js
...
mapper.getServerFilenamesToDelete();
```

### 3.5. After 3.4. you can make an array of inputs in the form:
```js
...
import { makeArrayInputs } from "./js/arrayInputs.js";

var serverFilenamesToDeleteEl = ...
var mapper = ...
makeArrayInputs(serverFilenamesToDeleteEl, "filenameToDelete", mapper.getServerFilenamesToDelete());
```
