import RomCommand from './RomCommand';

export default class RomCommands {

    public commandList: RomCommand[];
    public commandMap: Map<string, RomCommand>;
    public keyCodeMap: Map<string, RomCommand>;

    constructor() {
        this.commandList = [];
        this.commandMap = new Map<string, RomCommand>();
        this.keyCodeMap = new Map<string, RomCommand>();
    }

    initWithData(dataList: any[]): void {
        dataList.forEach((data: any) => {
            let command: RomCommand = new RomCommand();
            command.initWithData(data);
            this.commandList.push(command);
            this.commandMap.set(command.name, command);
            if (command.keyCode) {
                this.keyCodeMap.set(command.keyCode, command);
            }
        })
    }

    get json(): any {
        let json: any[] = [];
        this.commandList.forEach(command => {
            json.push(command.json);
        });
        return json;
    }

    get commandNames(): string[] {
        let names: string[] = [];
        this.commandList.forEach(command => {
            let name: string = command.name;
            names.push(name);
        });
        return names;
    }

    get commandNamesWithKeyCodes(): string[] {
        let names: string[] = [];
        this.commandList.forEach(command => {
            let name: string = command.name;
            if (command.keyCode) {
                name = `${name} [${command.keyCode}]`;
            }
            names.push(name);
        });
        return names;
    }

    getCommandWithName(name: string): RomCommand | undefined {
        let command: RomCommand | undefined = this.commandMap.get(name);
        let commandCopy: RomCommand | undefined;
        if (command) {
            commandCopy = new RomCommand(command.name, command.type, Object.assign({}, command.data), command.keyCode);
        }
        return commandCopy;
    }

    getCommandWithKeyCode(keyCode: string): RomCommand | undefined {
        let command: RomCommand | undefined = this.keyCodeMap.get(keyCode);
        let commandCopy: RomCommand | undefined;
        if (command) {
            commandCopy = new RomCommand(command.name, command.type, Object.assign({}, command.data), command.keyCode);
        }
        return commandCopy;
    }

    addCommand(command: RomCommand): void {
        this.commandList.push(command);
        this.commandMap.set(command.name, command);
        if (command.keyCode) {
            this.keyCodeMap.set(command.keyCode, command);
        }
    }

    updateCommandWithName(commandName: string, command: RomCommand): void {
        let existingCommand: RomCommand | undefined = this.commandMap.get(command.name);
        if (existingCommand) {
            existingCommand.data = command.data;
            existingCommand.type = command.type;
            existingCommand.keyCode = command.keyCode;
        }
    }

    removeCommand(commandToRemove: RomCommand): void {
        console.log(`RomCommands: removeCommand: ${commandToRemove.name}`);
        let tempCommandList: RomCommand[] = [];
        let tempCommandMap: Map<string, RomCommand> = new Map<string, RomCommand>();
        let tempKeyCodeMap: Map<string, RomCommand> = new Map<string, RomCommand>();
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
