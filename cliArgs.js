import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Defining command line arguments
const argv = yargs(hideBin(process.argv))
    .option("port", {
        alias: 'p',
        description: 'the port to run the server on.',
        type: 'number',
        default: 4000
    })
    .option("single", {
        alias: 's',
        description: 'Open only a single file and close.',
        type: "boolean",
        default: false
    })
    .alias('help', 'h')
    .example([
        ['mdlhost [directory]', 'Takes the given directory or cwd and runs a server on given port.']
    ])
    .argv;

export default argv