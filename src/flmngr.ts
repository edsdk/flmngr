export interface IFile {
	name: string;
	fullPath: string;
	size: string;
	bytesSize: number;
	date: string;
	timestamp: number;
	imageSrc?: string;
	previewImageSrc?: string;
}

export function openFlmngr(
    conf: {
        urlFileManager: string,
        onOk: (
            files: IFile[]
        ) => void

        onlyImages?: boolean,
        isMultiple?: boolean,
        showOkCancelButtons?: boolean,
        dateFormat?: string,
        lang?: string,
        openLastDir?: boolean,
        branding?: boolean,
        maxFolderTreeWidth?: boolean,
        isIconsView?: true,
    }
) {
    preload(() => {
        (window as any).Flmngr.openFlmngr(conf);
    });
}

export function preload(onLoaded?: () => void) {
    includeJS(
        '//cdn.flmngr.com/flmngr.js',
        () => {
            if (onLoaded)
                onLoaded();
        }
    );
}

function includeJS(url: string, onLoaded?: () => void) {
    var scripts = document.getElementsByTagName("script");
    var alreadyExists = false;
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute("src");
        if (src != null && src.indexOf(url) !== -1)
            alreadyExists = true;
    }
    if (!alreadyExists) {
        var script = document.createElement("script") as any;
        script.type = "text/javascript";
        if (onLoaded) {
            if (script.readyState) {  // IE
                script.onreadystatechange = function () {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        onLoaded();
                    }
                };
            } else {  // Others browsers
                script.onload = function () {
                    onLoaded();
                };
            }
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    } else {
        if (onLoaded)
            onLoaded();
    }
}