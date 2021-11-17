#!/usr/bin/env node

import { createServer } from "http";
import { readFile } from "fs";
import { resolveEntryFile, resolveFile, resolveTitle, resolveStylesheet, resolveHtmlFile } from "./fileResolver.js"
import argv from "./cliArgs.js";
import open from "open";
import { marked } from "marked";
import sanitizeHtml from 'sanitize-html';

// Port to listen on
let port = argv.port;
// Entry file from args if provided
const entryFile = resolveEntryFile(argv._[0]);

const server = createServer((req, res) => {
    const filePath = resolveFile(req.url.slice(1));
    const stylesheet = resolveStylesheet();

    // If single flagged close server after css is finished returning.
    if (filePath.endsWith(".css") && argv.single) {
        res.on("close", () => {server.close()})
    };

    // Handles return of request
    if (filePath.endsWith(".md")) { // File is markdown
        const title = resolveTitle(filePath);
        readFile(filePath, {encoding: "utf-8"}, (err, data) => {
            if (err) {
                console.log(err);
                res.writeHead(404);
                res.end(JSON.stringify(err, null, 4));
                return;
            }
            const htmlContent = sanitizeHtml(marked.parse(data));
            readFile(resolveHtmlFile(), {encoding: "utf-8"}, (err, data) => {
                let page = data;
                page = page.replace("{{document-title}}", title);
                page = page.replace("{{css-file}}", stylesheet);
                page = page.replace("{{html-block}}", htmlContent);
                res.writeHead(200);
                res.end(page);
            });
        });
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
});

server.on('listening', () => {
    // Opens in local browser
    open("http://localhost:" + port + "/" + entryFile);
})

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        server.close();
        port++;
        server.listen(port)
    }
});

server.listen(port);