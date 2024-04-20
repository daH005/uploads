Few words about this project
----------------------------
`FilesHTMLUploading` - is set of JS-modules for HTML deciding following problems:
- Uploading files by multiple parts
- Mapping uploaded files in HTML
- Deleting uploaded files with HTML

I took care of:
- Mapping and deleting files already exist on the server
- Validation of files by `accept` attribute of `input` element
- Drag-and-drop uploading

Usage
-------------------------
1. Take `js` folder
2. Make following template and plug `js/manager.js` as module:
```html
<div id="uploader">
    <input type="file" accept="image/*,.docx" multiple data-input>
    <div data-drag>Drag</div>
    <div data-files></div>

    <template data-file-template>
        <div class="file">
            <div data-filename></div>
            <a target="_blank" data-url>Url</a>
            <div data-delete>Delete</div>
        </div>
    </template>

</div>

<script src="./js/manager.js" type="module">

    var manager = new FilesHTMLManager("#uploader");
    // that's all, manager is working

    // also you can to map files from the server:
    manager.addFakeCommonFile({
        name: "file.html",
        url: "https://google.com",
    });

</script>

```
3. Files for deleting have `fake_to_delete` file type for backend processing
