import { existsSync, statSync } from "fs";
import { basename, dirname, resolve, join, sep } from "path";
import { fileURLToPath, pathToFileURL } from "url";


const resolveEntryFile = function(fileArg) {
    let entryFile = "";

    // Change working directory if needed, and set entry file if provided.
    if (fileArg && existsSync(fileArg)) { //file arg entered and file exists.
        if (statSync(fileArg).isDirectory()) { // file arg is a directory
            process.chdir(resolve(fileArg));
        } else if (statSync(fileArg).isFile()) { // file arg is a file
            process.chdir(dirname(resolve(fileArg)));
            entryFile = basename(resolve(fileArg));
        }
    }  
    
    return entryFile;
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

const resolveFile = function (url) {
    let filePath = "";

    // Handles parsing absolute file requests for only css, empty requests, and all other requests
    if (url.startsWith("file") && existsSync(fileURLToPath(url)) && url.endsWith(".css")) {
        filePath = fileURLToPath(url);
    } else if (url == "") {
        filePath = join(url, "README.md");
    } else {
        filePath = url;
    }

    // If file is a folder, gets the Readme.md in folder
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, "README.md");
    }

    return filePath;
}

const resolveStylesheet = function () {
    // Resolves absolute path to filesheet if needed.
    let stylesheet = "";

    if (existsSync("style.css")) {
        stylesheet = "/style.css";
    } else {
        stylesheet = "http://localhost:" + port + "/" + pathToFileURL(join(__dirname, "style.css"));
    }

    return stylesheet;
}

export {
    resolveEntryFile,
    resolveFile,
    resolveTitle,
    resolveStylesheet
}