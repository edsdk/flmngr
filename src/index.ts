interface CSRFTokenResult {
    headers?: {[key: string]: string};
    params?: {[key: string]: string};
}

type FuncGetCSRFToken = (
    onSuccess: (
        result: CSRFTokenResult
    ) => void,
    onError: () => void
) => void;

interface FlmngrImageFormat {
    id: string;
    title: string;
    suffix: string;
    maxWidth: number|null;
    maxHeight: number|null;
}

export interface FlmngrFile {
    format: string; // FlmngrImageFormat.id
    url: string;
    isServerFile: boolean;
}

export interface FlmngrFileWithFormats extends FlmngrFile {
    formats: FlmngrFile[];
}

interface FlmngrLoadParams {
    waitForImgPenToo?: boolean; // default true
}

export enum FlmngrUploadMode {
    AUTORENAME ="AUTORENAME",
    OVERWRITE = "OVERWRITE"
}

interface FlmngrCreateParams extends FlmngrLoadParams {

    apiKey?: string; // you may omit it if you have already called Flmngr.load(apiKey) method

    urlFiles?: string;

    urlFileManager?: string;
    urlFileManager__CSRF?: FuncGetCSRFToken|null;
    urlFileManager__user?: string;
    urlFileManager__password?: string;

    accessKey?: string; // a secret key to access through the cloud backend at files.flmngr.com

    apiKeyUnsplash?: string;

    isMaximized?: boolean; // default false
    showMaximizeButton?: boolean; // default true
    showCloseButton?: boolean; // default true

    hideFiles?: string[];
    hideDirs?: string[];

    defaultUploadDir?: string;
    uploadThreads?: number;

    filesPerPortion?: number; // default 100

    imageFormats?: FlmngrImageFormat[];
}

interface FlmngrOpenParams extends FlmngrCreateParams {
    list?: null|string[];

    acceptExtensions?: string[];

    isMultiple?: boolean;
    allowReorder?: boolean;

    isMaximized?: boolean;
    showMaximizeButton?: boolean;
    showCloseButton?: boolean;

    createImageFormats?: string[];

    onFinish?: (files: FlmngrFileWithFormats[]) => void;
    onCancel?: () => void;
}

export interface FlmngrServerFile {
    url: string;

    name: string; // file name with ext
    size: number; // in bytes
    timestamp: number; // in msec

    // For images only
    blurHash?: string;
    width?: number;
    height?: number;
    formats?: {[key: string]: FlmngrServerFile}; // another image formats
}


interface FlmngrUploadParams extends FlmngrCreateParams {
    filesOrLinks: (File|string)[];
    dirUploads?: string;
    mode?: FlmngrUploadMode;

    onFinish?: (files: FlmngrServerFile[]) => void;
    onFail?: (error: string) => void;
}

interface FlmngrEditAndUploadParams extends FlmngrCreateParams {
    url: string; // URL or base64
    filename?: string; // filename to display (i. e. when passing base64 as url)
    dirUploads?: string; // used by default for external files
    onSave?: (urlNew: string) => void;
    onCancel?: () => void;
}

enum FlmngrImageFormatCreationMode {
    ALWAYS = "ALWAYS",
    IF_EXISTS = "IF_EXISTS",
    DO_NOT_UPDATE = "DO_NOT_UPDATE"
}

interface FlmngrCreateImageFormatsParams extends FlmngrCreateParams {
    urls: string[];
    createImageFormats: {[key: string]: FlmngrImageFormatCreationMode};

    showProgress?: boolean;

    onFinish: (result: {[url: string]: {[formatId: string]: string}}) => void;
    onProgress?: (finished: number, failed: number, total: number) => void;
    onCancel?: () => void;
}

interface FlmngrEditParams extends FlmngrCreateParams {
    url: string; // URL or base64
    onSave: (
        onExport: (
            name: string,
            ext: string,
            jpegQuality: number,
            onExported: (image: File) => void,
            onFail: () => void
        ) => void,
        onClose: () => void
    ) => void;
    onCancel?: () => void;
}

interface FlmngrSelectUrlsParams {
    apiKey?: string,
    isMultiple?: boolean,
    onFinish: (urls: string[]) => void,
    onCancel?: () => void
}

export class Flmngr {

    private static commonParams: Partial<FlmngrCreateParams> = null;
    public static load(
        params: Partial<FlmngrCreateParams>,
        on?: {
            onFlmngrAndImgPenLoaded?: () => void;
            onFlmngrLoaded?: () => void;
            onImgPenLoaded?: () => void;
        }
    ) {
        if (!!Flmngr.commonParams && !!Flmngr.commonParams.apiKey && !!params.apiKey && Flmngr.commonParams.apiKey !== params.apiKey)
            throw "Flmngr was called with another API key before:" + Flmngr.commonParams.apiKey + ". Now you call it with API key: " + params.apiKey + ".\nYou can not mix different API keys on one page";

        if (!Flmngr.commonParams && !params.apiKey)
            throw "You must pass API key on the first Flmngr usage";

        let callbacks: {
            onFlmngrAndImgPenLoaded?: () => void;
            onFlmngrLoaded?: () => void;
            onImgPenLoaded?: () => void;
        } = {};
        if (!!on) {
            callbacks = {...on};
        }

        if (!!callbacks.onFlmngrAndImgPenLoaded) {
            if (this.isFlmngrLoaded() && this.isImgPenLoaded()) {
                callbacks.onFlmngrAndImgPenLoaded();
                delete callbacks.onFlmngrAndImgPenLoaded;
            }
        }

        if (!!callbacks.onFlmngrLoaded) {
            if (this.isFlmngrLoaded()) {
                callbacks.onFlmngrLoaded();
                delete callbacks.onFlmngrLoaded;
            }
        }

        if (!!callbacks.onImgPenLoaded) {
            if (this.isImgPenLoaded()) {
                callbacks.onImgPenLoaded();
                delete callbacks.onImgPenLoaded;
            }
        }

        // Do not override base parameters on second time calls like Flmngr.open() where parameters may be overridden.
        // API key at this place is guaranteed the same, so there is no need to set it again.
        if (!Flmngr.commonParams)
            Flmngr.commonParams = params;

        if (!!on && !!on.onFlmngrAndImgPenLoaded) {
            if (!(window as any).onFlmngrAndImgPenLoadedArray)
                (window as any).onFlmngrAndImgPenLoadedArray = [];
            (window as any).onFlmngrAndImgPenLoadedArray.push(() => {
                on.onFlmngrAndImgPenLoaded();
            });
        }

        if (!!on && !!on.onFlmngrLoaded) {
            if (!(window as any).onFlmngrLoadedArray)
                (window as any).onFlmngrLoadedArray = [];
            (window as any).onFlmngrLoadedArray.push(() => {
                on.onFlmngrLoaded();
            });
        }

        if (!!on && !!on.onImgPenLoaded) {
            if (!(window as any).onImgPenLoadedArray)
                (window as any).onImgPenLoadedArray = [];
            (window as any).onImgPenLoadedArray.push(() => {
                on.onImgPenLoaded();
            });
        }

        (window as any).flmngrIntegration = "npm";

        Flmngr.includeJS(((params as any).cdnHost || "https://cloud.flmngr.com" ) + "/cdn/" + Flmngr.commonParams.apiKey + "/flmngr.js");
        Flmngr.includeJS(((params as any).cdnHost || "https://cloud.flmngr.com" ) + "/cdn/" + Flmngr.commonParams.apiKey + "/imgpen.js");
    }

    private static includeJS(urlJS: string) {
        let scripts = document.getElementsByTagName("script");
        let alreadyExists = false;
        let existingScript = null;
        for (let i = 0; i < scripts.length; i++) {
            let src = decodeURI(scripts[i].getAttribute("src"));
            if (src != null && src.indexOf(urlJS) !== -1) {
                alreadyExists = true;
                existingScript = scripts[i];
            }
        }
        if (!alreadyExists) {
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.src = urlJS;
            script.setAttribute("data-by-n1ed", "true");
            document.getElementsByTagName("head")[0].appendChild(script);
            return script;
        } else {
            return null;
        }
    }

    public static isLoaded(checkImgPenToo: boolean): boolean {
        return (
            Flmngr.isFlmngrLoaded() &&
            (!checkImgPenToo || Flmngr.isImgPenLoaded())
        );
    }

    public static isFlmngrLoaded(): boolean {
        return !!(window as any).flmngr;
    }

    public static isImgPenLoaded(): boolean {
        return !!(window as any).imgpen;
    }

    private static waitForLoaded(params: Partial<FlmngrCreateParams>, onLoaded: () => void) {
        if (Flmngr.isLoaded(params.waitForImgPenToo)) {
            onLoaded();
        } else {

            let loadParams: Partial<FlmngrCreateParams> = {};
            if (!!Flmngr.commonParams) {
                loadParams = {
                    ...Flmngr.commonParams
                };
            }
            if (!!params) {
                loadParams = {
                    ...loadParams,
                    ...params
                }
            }
            if (!!params.apiKey)
                loadParams.apiKey = params.apiKey;
            delete loadParams.waitForImgPenToo; // may be passed but won't be saved

            Flmngr.load(
                loadParams,
                params.waitForImgPenToo ? {onFlmngrAndImgPenLoaded: onLoaded} : {onFlmngrLoaded: onLoaded}
            );
        }
    }

    public static open(params: FlmngrOpenParams) {
        Flmngr.waitForLoaded(params, () => {
            let mergedParams = {
                ...this.commonParams,
                ...params
            };
            if (params.isMultiple !== null && !mergedParams.onFinish)
                throw "`onFinish` listener is required for `Flmngr.open()` method and wait for some file to be picked (when `isMultiple` != null)";
            (window as any).flmngr.open(mergedParams);
        });
    }

    public static upload(params: FlmngrUploadParams) {
        Flmngr.waitForLoaded(params, () => {
            let mergedParams = {
                ...this.commonParams,
                ...params
            };
            if (!mergedParams.filesOrLinks)
                throw "`filesOrLinks` parameter is required to call `Flmngr.upload()` method";
            (window as any).flmngr.upload(mergedParams);
        });
    }

    public static createImageFormats(params: FlmngrCreateImageFormatsParams) {
        Flmngr.waitForLoaded(params, () => {
            let mergedParams = {
                ...this.commonParams,
                ...params
            };
            (window as any).flmngr.createImageFormats(mergedParams);
        });
    }

    public static edit(params: FlmngrEditParams) {
        let forcedParams = {
            ...params,
            waitForImgPenToo: true
        };
        Flmngr.waitForLoaded(forcedParams, () => {
            let mergedParams = {
                ...this.commonParams,
                ...params
            };
            (window as any).flmngr.edit(mergedParams);
        });
    }

    public static editAndUpload(params: FlmngrEditAndUploadParams) {
        let forcedParams = {
            ...params,
            waitForImgPenToo: true
        };
        Flmngr.waitForLoaded(forcedParams, () => {
            let mergedParams = {
                ...this.commonParams,
                ...params
            };
            (window as any).flmngr.editAndUpload(mergedParams);
        });
    }

    public static getImageExtensions(): string[] {
        return ['png', 'jpeg', 'jpg', 'webp', 'svg', 'gif', 'bmp'];
    }

    public static getNoCacheUrl(url: string): string {
        if (!url)
            return url;
        if (url.indexOf("data:") > -1 || url.indexOf("blob:") > -1)
            return url;
        return url + (url.indexOf("?") > -1 ? "&" : "?") + "no-cache=" + new Date().getTime();
    }

    public static selectFiles(
        params: {
            isMultiple: boolean;
            acceptExtensions: string[];
            onFinish: (files: File[]) => void;
        }
    ) {
        let id = "Flmngr-select-files-" + new Date().getTime();
        let elForm = document.getElementById(id);
        if (elForm != null)
            elForm.parentNode.removeChild(elForm);

        elForm = document.createElement("form");
        elForm.setAttribute("id", id);
        elForm.setAttribute("enctype", "multipart/form-data");
        elForm.setAttribute("style", "display:none !important");
        document.querySelector("body").appendChild(elForm);

        let elInput: HTMLInputElement = document.createElement("input") as HTMLInputElement;
        elInput.setAttribute("type", "file");
        elInput.setAttribute("name", "file");
        elForm.appendChild(elInput);
        if (params.isMultiple)
            elInput.setAttribute("multiple", "multiple");

        if (params.acceptExtensions != null && params.acceptExtensions.length > 0) {
            let acceptMimeTypes: string[] = [];
            let mime = require("mime");
            for (const ext of params.acceptExtensions)
                acceptMimeTypes.push(mime.getType(ext));
            elInput.setAttribute("accept", acceptMimeTypes.join("|"));
        }

        let onChange = ((elInput: HTMLInputElement, onSelected: (files: File[]) => void) => {
            return () => {
                let files: File[] = [];
                for (let i = 0; i < elInput.files.length; i++)
                    files.push(elInput.files[i]);
                onSelected(files);
            };
        })(elInput, params.onFinish);

        elInput.addEventListener("change", onChange);
        elInput.click();
    }

    public static selectUrls(params: FlmngrSelectUrlsParams) {
        let forcedParams = {
            ...params,
            waitForImgPenToo: false
        };
        Flmngr.waitForLoaded(forcedParams, () => {
            let mergedParams = {
                ...this.commonParams,
                ...params
            };
            (window as any).flmngr.selectUrls(mergedParams);
        });
    }

    // Actually this is already a new API
    // But if somebody misunderstands this and thinks he has
    // the legacy API, he can tri to call this method
    // to get a link to the new API.
    public static getNewAPI() {
        return Flmngr;
    }

}

export default Flmngr;

// In such cases NPM package is imported by the URL:
// - https://cdn.skypack.dev/flmngr
//     or
// - https://unpgk.com/flmngr
//     or from a similar service like that.
// Usually such load means a developer does such import from <script> tag directly in HTML.
// This means we need to provide him with a way to retrieve a link to the API.
// So we:
//   1. Add a global variable
//   2. Call callbacks (if set)
(window as any).Flmngr = Flmngr;
if (!!(window as any).onFlmngrAPILoaded)
    (window as any).onFlmngrAPILoaded();
if (!!(window as any).onFlmngrAPILoadedArray)
    for (const callback of (window as any).onFlmngrAPILoadedArray)
        callback();