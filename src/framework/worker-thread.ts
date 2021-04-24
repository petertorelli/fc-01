import * as serialport from 'serialport';
const readline = require('@serialport/parser-readline');
const parser = new readline();

let g_port: serialport|undefined = undefined;

function start () {
    g_port = new serialport('/dev/ttyACM0', {
        baudRate: 921600
    });
    g_port.pipe(parser);
    parser.on('data', (line: string) => {
        //console.log(line);
        if (process.send) {
            process.send(line.toString());
        }
    });
}

function stop () {
    if (g_port) {
        g_port.close(error => {
            console.log('closed', error);
        });
    }
}

process.on('message', message => {
    const parts = message.split(/ /);
    if (parts.length < 1) {
        return;
    }
    if (parts[0] == 'start') {
        start();
    } else if (parts[0] == 'stop') {
        stop();
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
