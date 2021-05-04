import * as serialport from 'serialport';
const readline = require('@serialport/parser-readline');
const parser = new readline();
import * as fs from 'fs';

let g_port: serialport|undefined = undefined;
let fd:number = 0;

function send (message: string) {
    if (process.send) {
        process.send(message);
    }
}

function start (path: string) {
    console.log('open port', path);
    parser.on('data', (line: string) => {
        if (fd > 0) {
            fs.writeSync(fd, `${line}\n`);
        }
        send(line.toString());
    });
    g_port = new serialport(path, {
        baudRate: 921600
    }).on('error', error => {
        stop();
        console.log('opening port', error.message);
    });
    g_port.pipe(parser);
}

function stop () {
    if (g_port) {
        g_port.close(error => {
            console.log('closed', error);
        });
    }
    if (fd > 2) {
        fs.closeSync(fd);
    }
}

function record (state: string) {
    if (state == '1') {
        fd = fs.openSync("runlog.txt", "w");
    } else {
        fs.closeSync(fd);
        fd = 0;
    }
}

process.on('message', message => {
    const parts = message.split(/ /);
    if (parts.length < 1) {
        return;
    }
    if (parts[0] == 'start') {
        start(parts[1]);
    } else if (parts[0] == 'stop') {
        stop();
    } else if (parts[0] == 'ports') {
        serialport.list().then(list => {
            list.forEach(port => {
                send(`port ${port.path}`);
            });
        });
    } else if (parts[0] == 'record') {
        record(parts[1]);
    } else { //if (parts[0].match(/s[1234afblr]/)) {
        g_port?.write(message);
    }
});

/**
 * Exit the framework worker process. Any processes spawned by the framework
 * process must respond to the parent disconnect message and exit on their own,
 * otherwise we will have zombie processes filling up the machine.
 */
async function exit () {
    stop();
    process.exit();
}

/**
 * There are three ways to exist: SIGTERM, SIGINT, or disconnect from the
 * parent process, which is either Main or Renderer, depending on if the
 * framework was instantiated in the CLI or the GUI.
 */
process.on('SIGTERM', async () => {
    console.log("Child process SIGTERM");
    await exit();
}).on('SIGINT', async () => {
    console.log("Child process SIGINT");
    await exit();
}).on('disconnect', async () => {
    console.log("Child process disconnect");
    await exit();
});
