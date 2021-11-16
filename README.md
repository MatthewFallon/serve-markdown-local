# Serve Markdown Locally

This repo and npm package has one sole purpose. To be able to download a git documentation repo and use it locally as a website with linkage and a default style.

This server supports a custom stylesheet placed at the root of the folders you want to serve as `style.css` or provides a built-in stylesheet.

This server also supports a favicon placed at the root of the directory named `favicon.ico`

The command can be installed globally and used with the format:

```
mdlhost [--port <port-number>] [directory-or-file]
```

or with npx:

```
npx serve-markdown-local [--port <port-number>] [directory-or-file]
```

It takes an optional port to specify the port (defaults to 4000) to run on and an optional directory or file to serve from or uses the cwd of the command. If a file is provided the working directory will be treated as the direct parent directory of that file.

This is only meant to be run locally for convenience and is not expected to handle any security operations.