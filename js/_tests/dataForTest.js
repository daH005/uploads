import { createEmptyFile } from "../utils.js";
import { FakeFileType } from "../storage.js";
export const ACCEPT = "image/*,.docx";
export const URL = "https://google.com";
var Filename;
(function (Filename) {
    Filename["INDEX"] = "index.html";
    Filename["NOTES"] = "notes.txt";
    Filename["AVATAR"] = "avatar.png";
    Filename["BACKGROUND"] = "background.jpg";
    Filename["RESUME"] = "resume.docx";
    Filename["COURSE_WORK"] = "course_work.pdf";
})(Filename || (Filename = {}));
var FileType;
(function (FileType) {
    FileType["HTML"] = "text/html";
    FileType["PLAIN_TEXT"] = "text/plain";
    FileType["PNG"] = "image/png";
    FileType["JPG"] = "image/jpg";
    FileType["DOCX"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    FileType["PDF"] = "application/pdf";
})(FileType || (FileType = {}));
export const FAKE_COMMON_FILES_DATA = [
    {
        name: Filename.AVATAR,
        url: URL,
    },
    {
        name: Filename.NOTES,
        url: URL,
    },
    {
        name: Filename.INDEX,
        url: URL,
    },
];
export const FAKE_COMMON_FILENAME_FOR_DELETING = Filename.NOTES;
export const FILE_FOR_FAKE_REWRITING = createEmptyFile(Filename.AVATAR, FileType.PNG);
export const FILE_FOR_SIMPLE_UPLOADING = createEmptyFile(Filename.BACKGROUND, FileType.JPG);
export const FILE_FOR_UPLOADING_AND_DELETING = createEmptyFile(Filename.RESUME, FileType.DOCX);
export const INVALID_FILE = createEmptyFile(Filename.COURSE_WORK, FileType.PDF);
export const FINAL_CHECK_DATA = {
    [Filename.AVATAR]: FileType.PNG,
    [Filename.BACKGROUND]: FileType.JPG,
    [Filename.NOTES]: FakeFileType.TO_DELETE,
};
