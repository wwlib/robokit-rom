export default class RobotGroup {
    private _name;
    private _robotNames;
    constructor(name?: string);
    initWithData(data: any): void;
    get name(): string;
    get json(): any;
    get robotNames(): string[];
    addRobotName(name: string): void;
    removeRobotName(robotNameToRemove: string): void;
}
