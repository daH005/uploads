var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/** Формирует подстроку "[<name>=<value>]", либо просто "[<name>]" при отсутствующем `value`.
 * Удобно при формировании селекторов. */
function attrFormat(name, value) {
    var result = "[".concat(name);
    if (value) {
        result += "=\"".concat(value, "\"");
    }
    return result + "]";
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
var Uploader = /** @class */ (function () {
    // Инициализирует объект. Ожидает передачи непустого `UploaderOptions`.
    function Uploader(options) {
        /** Атрибут контейнера с файлами-элементами.
         * Значение атрибута - селектор input-элемента. */
        this.UPLOADED_FILES_ATTR_NAME = "data-file-input";
        /** Атрибут элемента, удаляющего файл. */
        this.DELETE_FILE_ATTR_NAME = "data-delete";
        /** Атрибут элемента с именем файла. */
        this.FILENAME_ATTR_NAME = "data-filename";
        /** Атрибут гиперссылки для просмотра превью файла. */
        this.PREVIEW_ATTR_NAME = "data-preview";
        /** Тип файла, уже загруженного на сервере. */
        this.FAKE_FILE_TYPE_NAME = "fake";
        /** Тип файла, который нужно удалить с сервера. */
        this.FAKE_FILE_TO_DELETE_TYPE_NAME = "fake del";
        /** Настройки по умолчанию. */
        this.defaultOptions = {
            allowedExtensions: [],
            unallowedExtensions: [],
            allowedKinds: [],
            anyAllowed: false,
        };
        this.options = __assign(__assign({}, this.defaultOptions), options);
        // @ts-ignore
        this.filesMap = new Map();
        this.parser = new DOMParser();
        this.setupEventsListeners();
    }
    Object.defineProperty(Uploader.prototype, "inputElement", {
        /** Input-элемент, через который загружаются файлы. */
        get: function () {
            return document.querySelector(this.options.selector);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Uploader.prototype, "labelElement", {
        /** Label-элемент, который может использоваться в качестве области
         * для перетаскивания на него файлов.
         **/
        get: function () {
            return document.querySelector("label" + attrFormat("for", this.inputElement.id));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Uploader.prototype, "uploadedFilesElement", {
        /** Контейнер для файлов-элементов. */
        get: function () {
            return document.querySelector(attrFormat(this.UPLOADED_FILES_ATTR_NAME, this.options.selector));
        },
        enumerable: false,
        configurable: true
    });
    /** Запускает обработчики событий - загрузки файлов через `inputElement`,
     * а также перетаскиваний на `labelElement`.
     **/
    Uploader.prototype.setupEventsListeners = function () {
        var _this = this;
        /** Обработка события - загрузки посредством нажатия кнопки и выбора файлов. */
        this.inputElement.addEventListener("input", function () {
            _this.handleNewFiles(_this.inputElement.files);
        });
        if (this.labelElement) {
            /** Обработка события - перетаскивания файлов на label-элемент. */
            this.labelElement.addEventListener("drop", function (event) {
                /** Отмена открытия файла в отдельной вкладке. */
                event.preventDefault();
                _this.handleNewFiles(event.dataTransfer.files);
            });
            this.labelElement.addEventListener("dragover", function (event) {
                /** Отмена открытия файла в отдельной вкладке. */
                event.preventDefault();
            });
        }
    };
    /** Обрабатывает список файлов, производит валидацию и записывает их в `filesMap`, а также в `inputElement.files`. */
    Uploader.prototype.handleNewFiles = function (files) {
        /** Перебираем полученные файлы. */
        for (var i = 0; i < files.length; i++) {
            var newFile = files[i];
            /** Проверяем валидность файла (расширение + `kind`). */
            if (this.fileIsValid(newFile) || this.options.anyAllowed) {
                var existingFile = this.filesMap.get(newFile.name);
                var previewURL = URL.createObjectURL(newFile);
                if (existingFile) {
                    /** Если файл существует в `filesMap` и он является "меткой"
                     * для удаления на сервере, то он будет переопределён новым файлом,
                     * а это значит, что нам нужно создать файл-элемент.
                     * */
                    if (existingFile.type == this.FAKE_FILE_TO_DELETE_TYPE_NAME) {
                        this.addUploadedFileElement(newFile.name, previewURL);
                    }
                }
                else {
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
    };
    /** Проверяет расширение и тип (`kind`) файла. */
    Uploader.prototype.fileIsValid = function (file) {
        var extension = this.getExtension(file.name);
        var kind = this.getKind(file.type);
        // @ts-ignore
        return (this.options.allowedExtensions.includes(extension) || this.options.allowedKinds.includes(kind)) && !this.options.unallowedExtensions.includes(extension);
    };
    ;
    /** Извлекает расширение из имени файла. */
    Uploader.prototype.getExtension = function (filename) {
        var separatedFilename = filename.split(".");
        return separatedFilename[separatedFilename.length - 1];
    };
    /** Извлекает kind из типа файла. */
    Uploader.prototype.getKind = function (type) {
        return type.split("/")[0];
    };
    /** Формирует файл-элемент и добавляет его в контейнер. */
    Uploader.prototype.addUploadedFileElement = function (filename, previewUrl) {
        var _this = this;
        /** Парсим html, формируя элемент. */
        var uploadFileElement = this.parser.parseFromString(this.options.uploadedFileElementHtml, "text/html").body.firstElementChild;
        var filenameElement = uploadFileElement.querySelector(attrFormat(this.FILENAME_ATTR_NAME));
        /** Указываем наименование файла. */
        filenameElement.textContent = filename;
        var deleteButtonElement = uploadFileElement.querySelector(attrFormat(this.DELETE_FILE_ATTR_NAME));
        /** Добавляем возможность удаления файла и его элемента. */
        deleteButtonElement.onclick = function () {
            uploadFileElement.remove();
            _this.deleteFile(filename);
        };
        var previewLinkElement = uploadFileElement.querySelector(attrFormat(this.PREVIEW_ATTR_NAME));
        if (previewLinkElement) {
            previewLinkElement.setAttribute("href", previewUrl);
            previewLinkElement.setAttribute("target", "_black");
        }
        /** Добавляет готовый файл-элемент в контейнер. */
        this.uploadedFilesElement.append(uploadFileElement);
    };
    /** Удаляет файл из `filesMap`.
     * Если файл - это "метка" файла, уже существующего на сервере,
     * то он преобразуется в "метку" для удаления файла на сервере.
     * В конце происходит перенос файлов из `filesMap` в `inputElement.files`.
     **/
    Uploader.prototype.deleteFile = function (filename) {
        if (this.filesMap.get(filename).type == this.FAKE_FILE_TYPE_NAME) {
            this.filesMap.set(filename, this.createFile(filename, this.FAKE_FILE_TO_DELETE_TYPE_NAME));
        }
        else {
            this.filesMap.delete(filename);
        }
        this.saveFilesInInput();
    };
    /** Создаёт фейковый объект `File`. */
    Uploader.prototype.createFile = function (filename, type) {
        return new File(["content"], filename, { type: type });
    };
    /** Создаёт фейковые файлы, которые уже имеются на сервере в наличии. */
    Uploader.prototype.createFakeFiles = function (filenamesAndUrls) {
        for (var i in filenamesAndUrls) {
            var filename = filenamesAndUrls[i][0];
            var url = filenamesAndUrls[i][1];
            this.filesMap.set(filename, this.createFile(filename, this.FAKE_FILE_TYPE_NAME));
            this.addUploadedFileElement(filename, url);
        }
    };
    /** Производит перенос файлов из хранилища `filesMap` в `inputElement.files`.
     * Требуется это, очевидно, для успешной отправки файлов по http-запросу.
     **/
    Uploader.prototype.saveFilesInInput = function () {
        var _this = this;
        var transfer = new DataTransfer();
        this.filesMap.forEach(function (file) {
            /** Fake-файл добавлять в запрос нет смысла, поскольку
             * он уже существует на сервере.
             **/
            if (file.type != _this.FAKE_FILE_TYPE_NAME) {
                transfer.items.add(file);
            }
        });
        this.inputElement.files = transfer.files;
    };
    return Uploader;
}());
