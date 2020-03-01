// Generated by dts-bundle v0.7.3

declare module 'robokit-rom' {
    import { sum } from 'robokit-rom/sum';
    import IRomApp from 'robokit-rom/rom/IRomApp';
    import RomCommand, { RomCommandData } from 'robokit-rom/rom/RomCommand';
    import RomCommands from 'robokit-rom/rom/RomCommands';
    export { sum, IRomApp, RomCommand, RomCommandData, RomCommands };
}

declare module 'robokit-rom/sum' {
    export function sum(a: number, b: number): number;
}

declare module 'robokit-rom/rom/IRomApp' {
    export default interface IRomApp {
        port: number;
        nluDefault: string;
        clientId: string;
        clientSecret: string;
        neo4j_url: string;
        neo4j_user: string;
        neo4j_password: string;
    }
}

declare module 'robokit-rom/rom/RomCommand' {
    export interface RomCommandData {
        name: string;
        type: string;
        data: any;
    }
    export default class RomCommand {
        name: string;
        type: string;
        data: any;
        constructor(name?: string, type?: string, data?: any);
        initWithData(data: RomCommandData): void;
        get json(): RomCommandData;
    }
}

declare module 'robokit-rom/rom/RomCommands' {
    import RomCommand from 'robokit-rom/rom/RomCommand';
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
}

