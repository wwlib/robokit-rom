"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs-extra');
// const jsonfile = require('jsonfile');
class Logger {
    static setLogDirectory(dir) {
        Logger._logDir = path.resolve(dir);
        console.log('setLogDirectory:', dir, Logger._logDir);
        Logger._logErrors = true;
        Logger._logInfo = true;
    }
    static getFilePath(type, robotName) {
        let result = path.resolve(Logger._logDir, `${Logger._startTime}_${type}.log`);
        if (robotName) {
            result = path.resolve(Logger._logDir, `${Logger._startTime}_${robotName}_${type}.log`);
        }
        return result;
    }
    static set logErrors(value) {
        Logger._logErrors = value;
    }
    static set logInfo(value) {
        Logger._logInfo = value;
    }
    static log(type, content, robotName) {
        let output = '';
        let filePath = '';
        const time = new Date().getTime() - this._startTime;
        if (content.length > 0 && !robotName) {
            output = `[${time}] ${content.join('\n  ')}\n`;
            filePath = Logger.getFilePath(type);
        }
        else if (content.length > 0 && robotName) {
            output = `[${time}:${robotName}] ${content.join('\n  ')}\n`;
            filePath = Logger.getFilePath(type, robotName);
        }
        if (output && filePath) {
            fs.outputFileSync(filePath, output, { flag: 'a' });
        }
    }
    static error(content, robotName) {
        if (Logger._logErrors) {
            Logger.log('error', content, robotName);
        }
    }
    static info(content, robotName) {
        if (Logger._logInfo) {
            Logger.log('info', content, robotName);
        }
    }
}
exports.default = Logger;
Logger._startTime = new Date().getTime();
Logger._logDir = '';
Logger._logErrors = false;
Logger._logInfo = false;
//# sourceMappingURL=Logger.js.map