const path = require('path');
const fs = require('fs-extra');
// const jsonfile = require('jsonfile');

export default class Logger {

    private static _startTime: number = new Date().getTime();
    private static _logDir: string = '';
    private static _logErrors: boolean = false;
    private static _logInfo: boolean = false;

    static setLogDirectory(dir: string) {
        Logger._logDir = path.resolve(dir);
        console.log('setLogDirectory:', dir, Logger._logDir);
        Logger._logErrors =  true;
        Logger._logInfo =  true;
    }

    static getFilePath(type: string, robotName?: string) {
        let result: string = path.resolve(Logger._logDir, `${Logger._startTime}_${type}.log`);
        if (robotName) {
            result = path.resolve(Logger._logDir, `${Logger._startTime}_${robotName}_${type}.log`);
        }
        return result;
    }

    static set logErrors(value: boolean) {
        Logger._logErrors = value
    }

    static set logInfo(value: boolean) {
        Logger._logInfo = value
    }

    static log(type: string, content: string[], robotName?: string) {
        let output: string = '';
        let filePath: string = '';
        const time: number = new Date().getTime() - this._startTime;
        if (content.length > 0 && !robotName) {
            output = `[${time}] ${content.join('\n  ')}\n`;
            filePath = Logger.getFilePath(type);
        } else if (content.length > 0 && robotName) {
            output = `[${time}:${robotName}] ${content.join('\n  ')}\n`;
            filePath = Logger.getFilePath(type, robotName);
        }
        if (output && filePath) {
            fs.outputFileSync(filePath, output, { flag: 'a'});
        }
    }

    static error(content: string[], robotName?: string) {
        if (Logger._logErrors) {
            Logger.log('error', content, robotName);
        }
    }

    static info(content: string[], robotName?: string) {
        if (Logger._logInfo) {
            Logger.log('info', content, robotName);
        }
    }
}