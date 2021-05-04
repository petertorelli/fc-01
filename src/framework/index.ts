/**
 * This wrapper loads the framework into its own process and then connects
 * the input source and output sink to the command parser and GMB,
 * respectively.
 *
 * NOTES:
 * The packager we are currently using for electron (electron-webpack) can
 * put the worker-thread.js in a different location depending on whether
 * we are in developer mode or production mode. Hence the path searching.
 */
 import * as child_process from 'child_process';
 import * as path from 'path';
 import * as console from 'console';
 import { EventEmitter } from 'events';

class Framework extends EventEmitter {
    private worker: child_process.ChildProcess|null = null;
    constructor () {
        super();
    }
    /**
     * We can't start the process in the constructor because we need to
     * explicitly wait for the system to be ready to accept input from
     * the child process responses. We also don't know where to put intermediate
     * files until initialization since it will vary based on who inits the
     * framework.
     *
     * @param homeDir Where to put user and temp files.
     */
    public init () {
        // Figure out where electron-webpacker put the worker!
        let wDir;
        if (process.env.NODE_ENV === 'development') {
            wDir = path.resolve('.', 'dist', 'main', 'worker-thread.js');
        } else {
            wDir = path.resolve(__dirname, 'worker-thread.js');
        }
        this.worker = child_process.fork(wDir);
        // Listen to all possible process events becasue this is complicated.
        this.worker.on('close', code => this.workerClose(code));
        this.worker.on('disconnect', () => this.workerDisconnect());
        this.worker.on('error', error => this.workerError(error));
        this.worker.on('exit', (code, signal) => this.workerExit(code, signal));
        this.worker.on('message', message => this.workerMessage(message));
    }
    public getPorts () {
        if (this.worker) {
            this.worker.send('ports');
        }
    }
    public send (message: string) {
        if (this.worker) {
            this.worker.send(message);
        }
    }
    public sendAck (message: string) {
        return new Promise<void>(resolve => {
            const listen = (message: string) => {
                if (message.match(/^1/)) {
                    this.worker?.removeListener('message', listen);
                    resolve();
                }
                else if (message.match(/^0/)) {
                    this.worker?.removeListener('message', listen);
                    resolve();
                }
            };
            this.worker?.on('message', listen);
            this.send(message);
        });
    }
    public destructor () {
        if (this.worker) {
            console.log("Killing worker");
            this.worker.kill();
        } else {
            console.log("Worker was already killed");
        }
    }
    private workerClose (code: number) {
        console.log('Worker closed, code:', code);
    }
    private workerDisconnect () {
        console.log('Worker disconnected');
    }
    private workerError (error: Error) {
        console.error('Worker error:', error);
    }
    private workerExit (code: number|null, signal: any) {
        console.log('Worker exit, code:', code, ', signal:', signal);
    }
    public workerMessage (message: any) {
        const parts = message.split(' ');
        if (parts.length < 1) {
            return;
        }
        if (parts[0] == 't') {
            this.emit('telemetry', parts.splice(1, 10));
        } else if (parts[0] == 'port') {
            this.emit('port', parts[1]);
        }
    }
}

export const framework = new Framework();
