"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RomCommand_1 = require("./RomCommand");
class RomCommands {
    constructor() {
        this.commandList = [];
        this.commandMap = new Map();
        this.keyCodeMap = new Map();
    }
    initWithData(dataList) {
        dataList.forEach((data) => {
            let command = new RomCommand_1.default();
            command.initWithData(data);
            this.commandList.push(command);
            this.commandMap.set(command.name, command);
            if (command.keyCode) {
                this.keyCodeMap.set(command.keyCode, command);
            }
        });
    }
    get json() {
        let json = [];
        this.commandList.forEach(command => {
            json.push(command.json);
        });
        return json;
    }
    get commandNames() {
        let names = [];
        this.commandList.forEach(command => {
            let name = command.name;
            names.push(name);
        });
        return names;
    }
    get commandNamesWithKeyCodes() {
        let names = [];
        this.commandList.forEach(command => {
            let name = command.name;
            if (command.keyCode) {
                name = `${name} [${command.keyCode}]`;
            }
            names.push(name);
        });
        return names;
    }
    getCommandWithName(name) {
        let command = this.commandMap.get(name);
        let commandCopy;
        if (command) {
            commandCopy = new RomCommand_1.default(command.name, command.type, Object.assign({}, command.data), command.keyCode);
        }
        return commandCopy;
    }
    getCommandWithKeyCode(keyCode) {
        let command = this.keyCodeMap.get(keyCode);
        let commandCopy;
        if (command) {
            commandCopy = new RomCommand_1.default(command.name, command.type, Object.assign({}, command.data), command.keyCode);
        }
        return commandCopy;
    }
    addCommand(command) {
        this.commandList.push(command);
        this.commandMap.set(command.name, command);
        if (command.keyCode) {
            this.keyCodeMap.set(command.keyCode, command);
        }
    }
    updateCommandWithName(commandName, command) {
        let existingCommand = this.commandMap.get(command.name);
        if (existingCommand) {
            existingCommand.data = command.data;
            existingCommand.type = command.type;
            existingCommand.keyCode = command.keyCode;
        }
    }
    removeCommand(commandToRemove) {
        // console.log(`RomCommands: removeCommand: ${commandToRemove.name}`);
        let tempCommandList = [];
        let tempCommandMap = new Map();
        let tempKeyCodeMap = new Map();
        this.commandList.forEach(command => {
            if (command.name != commandToRemove.name) {
                tempCommandList.push(command);
                tempCommandMap.set(command.name, command);
                if (command.keyCode) {
                    tempKeyCodeMap.set(command.keyCode, command);
                }
            }
        });
        this.commandList = tempCommandList;
        this.commandMap = tempCommandMap;
        this.keyCodeMap = tempKeyCodeMap;
    }
}
exports.default = RomCommands;
//# sourceMappingURL=RomCommands.js.map