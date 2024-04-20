import { inputFiles, inputFakeFiles, deleteFiles, checkFiles } from "./utilsForTest.js";
import { FAKE_COMMON_FILES_DATA, 
         FAKE_COMMON_FILENAME_FOR_DELETING, 
         FILE_FOR_FAKE_REWRITING,
         FILE_FOR_SIMPLE_UPLOADING,
         FILE_FOR_UPLOADING_AND_DELETING,
         INVALID_FILE,
         FINAL_CHECK_DATA, } from "./dataForTest.js";

function testAll(): void {
    inputFakeFiles(FAKE_COMMON_FILES_DATA);
    deleteFiles([FAKE_COMMON_FILENAME_FOR_DELETING]);
    inputFiles([FILE_FOR_FAKE_REWRITING, FILE_FOR_SIMPLE_UPLOADING]);
    inputFiles([FILE_FOR_UPLOADING_AND_DELETING]);
    deleteFiles([FILE_FOR_UPLOADING_AND_DELETING.name]);
    inputFiles([INVALID_FILE]);
    checkFiles(FINAL_CHECK_DATA);

    console.log("testAll - OK");
}
testAll();
