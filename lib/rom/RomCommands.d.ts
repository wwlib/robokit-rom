import RomCommand from './RomCommand';
export default class RomCommands {
    commandList: RomCommand[];
    commandMap: Map<string, RomCommand>;
    constructor();
    initWithData(dataList: any[]): void;
    get json(): any;
    get commandNames(): string[];
    getCommandWithName(name: string): RomCommand | undefined;
    addCommand(command: RomCommand): void;
    updateCommandWithName(commandName: string, command: RomCommand): void;
    removeCommand(commandToRemove: RomCommand): void;
}
