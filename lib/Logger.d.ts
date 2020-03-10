export default class Logger {
    private static _startTime;
    private static _logDir;
    private static _logErrors;
    private static _logInfo;
    static setLogDirectory(dir: string): void;
    static getFilePath(type: string, robotName?: string): string;
    static set logErrors(value: boolean);
    static set logInfo(value: boolean);
    static log(type: string, content: string[], robotName?: string): void;
    static error(content: string[], robotName?: string): void;
    static info(content: string[], robotName?: string): void;
}
