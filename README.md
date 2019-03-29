# Flmngr file manager SDK

> File manager SDK for your websites and applicatoins. Both **client** and **server** side modules.

**Flmngr** is full featured file manager for your current or future app or website. You can add this module to instantly have feature to manage files on your webserver: to allow users to upload, edit and choose files, to build a structure for your files and images, to delete or download them.

It can be perfectly integrated with common CMSs (WordPress, Drupal, Joomla, etc), with popular client frameworks (React, Angular, Vue, etc.), server frameworks (Laravel, Symphony, YII, RoR, Django, etc.) and in any other code using API.

The great advantage of Flmngr are tools for full stack application integration.
Flmngr contains both client script (JS/TypeScript) and [server side](https://npmjs.com/package/@edsdk/flmngr-server) in **PHP**, **Node** and **Java** for saving images on your server. It also has microservice feature for those who would like to use uploader separately or uses different language on server side.

Deploy and run your **own demo in 1 min** using [Flmngr example](https://github.com/edsdk/flmngr-example) repository.



## Install

With [npm](https://npmjs.com/) installed, run

```
$ npm install @edsdk/flmngr
```

Yarn users can run

```
$ yarn add @edsdk/flmngr
```


## Usage

```js
    openFlmngr({
		urlFileManager: 'http://localhost:8080/flmngr/',
		onOk: (files: IFile[]) => {
            for (const file of files)
                console.log(`${file.name} (${file.size})`);
        },
    });
```

This code immediately opens Flmngr fullscreen dialog in your browser letting user to specify some files, probably with uploading them. When user confirms its selection, the dialog is being closed and `onOk` callback is processed. In this password we just print info about files into console.

You need to have [@edsdk/flmngr-server package](https://npmjs.com/package/@edsdk/flmngr-server) installed and started on the URL equal to `urlFileManager` you've passed to your frontend part of Flmngr.


## API

```js
function openFlmngr({
    urlFileManager: string,
    onOk: (
        files: IFile[]
    ) => void

    onCancel?: () => void,
    onSelected?: (files: IFile[]) => null | boolean
    onlyImages?: boolean,
    isMultiple?: boolean,
    urlFiles?: string,
    dateFormat?: string,
    openLastDir?: boolean,
    branding?: boolean,
    maxFolderTreeWidth?: boolean,
    isIconsView?: true,
});
```

- `urlFileManager` - URL of Flmngr server in binded to (be sure CORS is enabled for external resources)
- `onOk` - callback for files specified and "Ok" button is pressed event

Optional parameters:

- `onCancel` - callback for case user had closed Flmngr without selecting a file
- `onSelected` - callback called on any files selection change. It gets files array as argument and returns the flag of ability to choose exactly this files. Return `true` if you want to set "Ok" button enabled, `false` to disable it or `null` if you want to make it enabled or disabled based on flags `onlyImages` and `isMultiple` (default)
- `onlyImages` - show and allow to choose images only, default is `false`
- `isIconsView` - show files as icons or as table. `true` is default
- `isMultiple` - allow to choose many files or just once, default is `true`
- `urlFiles` - URL prefix to uploaded files i. e. `https://somesite.com/files/`
- `dateFormat` - format to print all file time attributes in, `DD/MM/YYYY HH:mm` by default
- `openLastDir` - do Flmngr to open last opened directoty on future Flmngr uses. `fm_lastDir` cookie is used for saving it. This option affects only if you open Flmngr without files preselected. Default is `true`
- `branding` - do show name of Flmngr in UI, default is `true`
- `maxFolderTreeWidth` - maximum width of directories view, `250` is default
- `isIconsView` - do show previews of images or table view is default, default is `true`


#### Preloading

To avoid network delays you can preload Flmngr at any moment (e. g. you page is loaded):

```js
function preload(callback?: () => void);
```

After this call all next `openFlmngr` calls will be faster. If you do not use `preload`, calling `openFlmngr` first time can be slower.
You can also pass `callback` function if you want to execute some code right after Flmngr libraries were preloaded.


## See Also

- Website: [flmngr.com](https://flmngr.com)
- ImgPen image editor: [imgpen.com](https://imgpen.com)
- Flmngr backend package: [npm package](https://npmjs.org/package/@edsdk/flmngr-server)  |  [GitHub project](https://github.com/edsdk/flmngr-server)
- Flmngr example: [npm package](https://npmjs.org/package/@edsdk/flmngr-example)  |  [GitHub project](https://github.com/edsdk/flmngr-example)


## License

Double licensing:

1. Trial EdSDK license
    - All features
    - NOT for commercial usage (except trial purposes on dev server)
    - [Server side](https://npmjs.com/package/@edsdk/flmngr-server) in TypeScript/JavaScript only.

2. Commercial EdSDK license
    - All features
    - Commercial usage is allowed
    - No "powered by" link is required
    - Node (JavaScript, TypeScript), Java and PHP backends
    - OEM usage in applications is an option
    - [Purchase a license](https://flmngr.com) in order to use it