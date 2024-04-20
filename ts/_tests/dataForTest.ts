import { createEmptyFile } from "../utils.js";
import { FakeFileType } from "../storage.js";
import { FakeCommonFileData } from "../manager.js";

export const ACCEPT: string = "image/*,.docx";
export const URL: string = "https://google.com";

enum Filename {
    INDEX = "index.html",
    NOTES = "notes.txt",
    AVATAR = "avatar.png",
    BACKGROUND = "background.jpg",
    RESUME = "resume.docx",
    COURSE_WORK = "course_work.pdf",
}

enum FileType {
    HTML = "text/html",
    PLAIN_TEXT = "text/plain",
    PNG = "image/png",
    JPG = "image/jpg",
    DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    PDF = "application/pdf",
}

export const FAKE_COMMON_FILES_DATA: FakeCommonFileData[] = [
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
]

export const FAKE_COMMON_FILENAME_FOR_DELETING: string = Filename.NOTES;

export const FILE_FOR_FAKE_REWRITING: File = createEmptyFile(
    Filename.AVATAR,
    FileType.PNG,
)

export const FILE_FOR_SIMPLE_UPLOADING: File = createEmptyFile(
    Filename.BACKGROUND,
    FileType.JPG,
)

export const FILE_FOR_UPLOADING_AND_DELETING: File = createEmptyFile(
    Filename.RESUME,
    FileType.DOCX,
)

export const INVALID_FILE: File = createEmptyFile(
    Filename.COURSE_WORK,
    FileType.PDF,
)

export const FINAL_CHECK_DATA: Object = {
    [Filename.AVATAR]: FileType.PNG,
    [Filename.BACKGROUND]: FileType.JPG,
    [Filename.NOTES]: FakeFileType.TO_DELETE,
}
