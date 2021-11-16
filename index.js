#!/usr/bin/env node

import { createServer } from "http";
import { existsSync, readFile, statSync } from "fs";
import { basename, dirname, resolve, join, sep } from "path";
import open from "open";
import { fileURLToPath, pathToFileURL } from "url";
import htmlToMarkdown from "markdown-to-html";
const Markdown = htmlToMarkdown.Markdown;
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
    .option("port", {
        alias: 'p',
        description: 'the port to run the server on.',
        type: 'number',
        default: 4000
    })
    .alias('help', 'h')
    .example([
        ['mdlhost [directory]', 'Takes the given directory or cwd and runs a server on given port.']
    ])
    .argv;

// Common workaround to get the dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Port to listen on
const port = argv.port;

let entryFile = "";

// Change working directory if needed, and set entry file if provided.
if (argv._[0] && existsSync(argv._[0]) && statSync(argv._[0]).isDirectory()) {
    process.chdir(resolve(argv._[0]));
} else if (argv._[0] && existsSync(argv._[0]) && statSync(argv._[0]).isFile()) {
    process.chdir(dirname(resolve(argv._[0])));
    entryFile = basename(resolve(argv._[0]));
}

const resolveTitle = function (filePath) {
    if (basename(filePath, ".md") == "README") {
        let dirPath = dirname(filePath).split("/");
        if (dirPath[dirPath.length - 1] == ".") {
            let workingDir = resolve(process.cwd()).split(sep);
            return workingDir[workingDir.length - 1];
        } else {
            return dirPath[dirPath.length - 1];
        }
    } else {
        return basename(filePath, ".md");
    }
}


createServer((req, res) => {
    let filePath = "";
    let urlPath = req.url.slice(1);

    // Handles parsing absolute file requests for only css, empty requests, and all other requests
    if (urlPath.startsWith("file") && existsSync(fileURLToPath(urlPath)) && urlPath.endsWith(".css")) {
        filePath = fileURLToPath(urlPath);
    } else if (urlPath == "") {
        filePath = join(urlPath, "README.md");
    } else {
        filePath = urlPath;
    }

    // If file is a folder, gets the Readme.md in folder
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, "README.md");
    }

    // Resolves absolute path to filesheet if needed.
    let stylesheet = "";
    if (existsSync("style.css")) {
        stylesheet = "/style.css";
    } else {
        stylesheet = "http://localhost:" + port + "/" + pathToFileURL(join(__dirname, "style.css"));
    }

    // Handles return of request
    if (filePath.endsWith(".md")) { // File is markdown
        const mdOpts = {
            title: resolveTitle(filePath),
            stylesheet: stylesheet
        }
        let md = new Markdown();
        md.render(filePath, mdOpts, (err) => {
            if (err) {
                console.log(err)
                res.writeHead(404)
                res.end(JSON.stringify(err, null, 4));
                return;
            }
            res.writeHead(200);
            md.pipe(res);
        })
    } else { // Other file types return directly.
        readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err, null, 4));
                return;
            }
            res.writeHead(200);
            res.end(data);
        })
    }
}).listen(port);

// Opens in local browser
open("http://localhost:" + port + "/" + entryFile);