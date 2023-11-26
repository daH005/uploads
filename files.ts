/** Формирует подстроку "[<name>=<value>]", либо просто "[<name>]" при отсутствующем `value`.
 * Удобно при формировании селекторов. */
function attrFormat(name: string, value?: string): string {
    let result: string = `[${name}`;
    if (value) {
        result += `="${value}"`
    }
    return result + "]";
}

/** Перечень настроек для конструктора `Uploader`. */
interface UploaderOptions {
    /** Селектор input-элемента для загрузки файлов. */
    readonly selector?: string,
    /** Список расширений файлов, доступных к загрузке. */
    readonly allowedExtensions?: string[],
    /** Список расширений файлов, запрещённых для загрузки. */
    readonly unallowedExtensions?: string[],
    /** Список типов файлов, доступных к загрузке
     * В данном случае под типом подразумевается подстрока за "/"
     * из свойства `File.type`. Например для того, чтобы можно было загружать
     * только изображения ("image/png", "image/jpg") можно выставить "image". 
     **/
    readonly allowedKinds?: string[],
    /** Флаг, отражающий, что к загрузке доступны любые файлы. */
    readonly anyAllowed?: boolean,
    /** Html-код элемента, отражающего загруженный файл.  */
    readonly uploadedFileElementHtml?: string,
}

/** Объект, предоставляющий удобный функционал для загрузки файлов и их отправки на сервер.
 * 
 * `Uploader` предоставляет следующие возможности:
 * - Загрузка множества файлов с несколькими подходами, т.е. накопление.
 * - Отображение файлов-элементов. Каждый из которых располагает названием файла и кнопкой для удаления.
 * - Загрузка файлов переносом на label[for="id input-элемента"].
 * - Создание фейковых файлов для отображения их реального наличия на сервере.
 *   Удалённые fake-файлы высылаются на сервер с типом "fake del", неудалённые - просто "fake".
 * 
 * Подготовка HTML:
 * 1. Создать input-элемент.
 * 2. Создать контейнер для файлов-элементов (контейнеру необходимо добавить
 *    атрибут data-file-input со значением - "селектор input-элемента").
 * 2.1. Вы можете добавить label[for="id input-элемента"] для возможности загрузки файлов
 *      посредством их переноса на label.
 * 3. Создание объекта `Uploader`:
 *    var uploader = new Uploader({
 *        selector: "selector input-элемента",
 *        ...  // Остальные настройки изучайте в `UploaderOptions` (выше по модулю).
 *    });
 * 4. Вы можете передать список наименований файлов, уже загруженных на сервере так:
 *    uploader.createFakeFiles(["image.png", "word.docx", ...]); 
 **/
class Uploader {

    /** Атрибут контейнера с файлами-элементами.
     * Значение атрибута - селектор input-элемента. */
    public readonly UPLOADED_FILES_ATTR_NAME: string = "data-file-input";
    /** Атрибут элемента, удаляющего файл. */
    public readonly DELETE_FILE_ATTR_NAME: string = "data-delete";
    /** Атрибут элемента с именем файла. */
    public readonly FILENAME_ATTR_NAME: string = "data-filename";
    /** Атрибут гиперссылки для просмотра превью файла. */
    public readonly PREVIEW_ATTR_NAME: string = "data-preview";
    /** Тип файла, уже загруженного на сервере. */
    public readonly FAKE_FILE_TYPE_NAME: string = "fake";
    /** Тип файла, который нужно удалить с сервера. */
    public readonly FAKE_FILE_TO_DELETE_TYPE_NAME: string = "fake del";

    /** Настройки по умолчанию. */
    public readonly defaultOptions: UploaderOptions = {
        allowedExtensions: [],
        unallowedExtensions: [],
        allowedKinds: [],
        anyAllowed: false,
    }
    /** Итоговые настройки объекта. */
    public readonly options: UploaderOptions;

    /** Словарь, в котором:
     * каждый ключ - наименование файла, который необходимо загрузить на сервер,
     * а значение - сам файл (также сюда входят и фейковые файлы).
     * Представляет собой временное хранилище файлов, которые
     * переносятся в `inputElement.files`. 
     **/
    // @ts-ignore
    public readonly filesMap: Map<File.name, File>;
    /** Парсер для создания файлов-элементов. */
    public readonly parser: DOMParser;

    // Инициализирует объект. Ожидает передачи непустого `UploaderOptions`.
    public constructor(options: UploaderOptions) {
        this.options = {...this.defaultOptions, ...options}
        // @ts-ignore
        this.filesMap = new Map();
        this.parser = new DOMParser();
        this.setupEventsListeners();
    }

    /** Input-элемент, через который загружаются файлы. */
    public get inputElement(): HTMLInputElement {
        return document.querySelector(this.options.selector);
    }

    /** Label-элемент, который может использоваться в качестве области
     * для перетаскивания на него файлов.
     **/
    public get labelElement(): HTMLLabelElement {
        return document.querySelector("label" + attrFormat("for", this.inputElement.id));
    }

    /** Контейнер для файлов-элементов. */
    public get uploadedFilesElement(): HTMLElement {
        return document.querySelector(attrFormat(this.UPLOADED_FILES_ATTR_NAME, this.options.selector));
    }

    /** Запускает обработчики событий - загрузки файлов через `inputElement`,
     * а также перетаскиваний на `labelElement`. 
     **/
    protected setupEventsListeners(): void {
        /** Обработка события - загрузки посредством нажатия кнопки и выбора файлов. */
        this.inputElement.addEventListener("input", (): void => {
            this.handleNewFiles(this.inputElement.files);
        });
        if (this.labelElement) {
            /** Обработка события - перетаскивания файлов на label-элемент. */
            this.labelElement.addEventListener("drop", (event: DragEvent): void => {
                /** Отмена открытия файла в отдельной вкладке. */
                event.preventDefault();
                this.handleNewFiles(event.dataTransfer.files);
            });
            this.labelElement.addEventListener("dragover", (event: DragEvent): void => {
                /** Отмена открытия файла в отдельной вкладке. */
                event.preventDefault();
            });
        }
    }

    /** Обрабатывает список файлов, производит валидацию и записывает их в `filesMap`, а также в `inputElement.files`. */
    public handleNewFiles(files: FileList | File[]): void {
        /** Перебираем полученные файлы. */
        for (let i = 0; i < files.length; i++) {
            let newFile: File = files[i];
            /** Проверяем валидность файла (расширение + `kind`). */
            if (this.fileIsValid(newFile) || this.options.anyAllowed) {
                let existingFile: File = this.filesMap.get(newFile.name);
                let previewURL: string = URL.createObjectURL(newFile);
                if (existingFile) {
                    /** Если файл существует в `filesMap` и он является "меткой"
                     * для удаления на сервере, то он будет переопределён новым файлом,
                     * а это значит, что нам нужно создать файл-элемент. 
                     * */
                    if (existingFile.type == this.FAKE_FILE_TO_DELETE_TYPE_NAME) {
                        this.addUploadedFileElement(newFile.name, previewURL);
                    }
                } else {
                    /** Если файла не существует, то однозначно нужно создать под него
                     * элемент. */
                    this.addUploadedFileElement(newFile.name, previewURL);
                }
                /** Обновляем общее хранилище файлов, записав в него
                 * текущие имя файла и сам файл. 
                 **/
                this.filesMap.set(newFile.name, newFile);
            }
        }
        /** Переносим файлы из временного хранилища `filesMap` в `inputElement.files`. */
        this.saveFilesInInput();
    }

    /** Проверяет расширение и тип (`kind`) файла. */
    public fileIsValid(file: File): boolean {
        let extension: string = this.getExtension(file.name);
        let kind: string = this.getKind(file.type);
        // @ts-ignore
        return (this.options.allowedExtensions.includes(extension) || this.options.allowedKinds.includes(kind)) && !this.options.unallowedExtensions.includes(extension);
    };

    /** Извлекает расширение из имени файла. */
    public getExtension(filename: string): string {
        let separatedFilename: string[] = filename.split(".");
        return separatedFilename[separatedFilename.length - 1];
    }

    /** Извлекает kind из типа файла. */
    public getKind(type: string): string {
        return type.split("/")[0];
    }

    /** Формирует файл-элемент и добавляет его в контейнер. */
    protected addUploadedFileElement(filename: string, previewUrl: string): void {
        /** Парсим html, формируя элемент. */
        let uploadFileElement: Element = this.parser.parseFromString(this.options.uploadedFileElementHtml,
                                                                     "text/html").body.firstElementChild;
        let filenameElement: HTMLElement = uploadFileElement.querySelector(attrFormat(this.FILENAME_ATTR_NAME));
        /** Указываем наименование файла. */
        filenameElement.textContent = filename;
        let deleteButtonElement: HTMLElement = uploadFileElement.querySelector(attrFormat(this.DELETE_FILE_ATTR_NAME));
        /** Добавляем возможность удаления файла и его элемента. */
        deleteButtonElement.onclick = (): void => {
            uploadFileElement.remove();
           this.deleteFile(filename);
        };
        let previewLinkElement: HTMLElement = uploadFileElement.querySelector(attrFormat(this.PREVIEW_ATTR_NAME));
        if (previewLinkElement) {
            previewLinkElement.setAttribute("href", previewUrl);
            previewLinkElement.setAttribute("target", "_black");
        }
        /** Добавляет готовый файл-элемент в контейнер. */
        this.uploadedFilesElement.append(uploadFileElement);
    }

    /** Удаляет файл из `filesMap`.
     * Если файл - это "метка" файла, уже существующего на сервере,
     * то он преобразуется в "метку" для удаления файла на сервере.
     * В конце происходит перенос файлов из `filesMap` в `inputElement.files`. 
     **/
    public deleteFile(filename: string): void {
        if (this.filesMap.get(filename).type == this.FAKE_FILE_TYPE_NAME) {
            this.filesMap.set(filename, this.createFile(filename, this.FAKE_FILE_TO_DELETE_TYPE_NAME));
        } else {
            this.filesMap.delete(filename);
        }
        this.saveFilesInInput();
    }

    /** Создаёт фейковый объект `File`. */
    public createFile(filename: string, type: string): File {
        return new File(["content"], filename, {type: type});
    }

    /** Создаёт фейковые файлы, которые уже имеются на сервере в наличии. */
    public createFakeFiles(filenamesAndUrls: string[]): void {
        for (let i in filenamesAndUrls) {
            let filename: string = filenamesAndUrls[i][0];
            let url: string = filenamesAndUrls[i][1];
            this.filesMap.set(filename, this.createFile(filename, this.FAKE_FILE_TYPE_NAME));
            this.addUploadedFileElement(filename, url);
        }
    }

    /** Производит перенос файлов из хранилища `filesMap` в `inputElement.files`. 
     * Требуется это, очевидно, для успешной отправки файлов по http-запросу. 
     **/
    public saveFilesInInput(): void {
        let transfer: DataTransfer = new DataTransfer();
        this.filesMap.forEach((file: File): void => {
            /** Fake-файл добавлять в запрос нет смысла, поскольку
             * он уже существует на сервере. 
             **/
            if (file.type != this.FAKE_FILE_TYPE_NAME) {
                transfer.items.add(file);
            }
        });
        this.inputElement.files = transfer.files;
    }

}
