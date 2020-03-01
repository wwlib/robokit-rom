export default class RobotGroup {
    name: string;
    robotList: string[];
    constructor(name?: string);
    initWithData(data: any): void;
    get json(): any;
    get robotNames(): string[];
    addRobotName(name: string): void;
    removeRobotName(robotNameToRemove: string): void;
}
