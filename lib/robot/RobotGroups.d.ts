import RobotGroup from './RobotGroup';
export default class RobotGroups {
    robotGroupsMap: Map<string, RobotGroup>;
    constructor();
    initWithData(dataList: any[]): void;
    get json(): any[];
    get robotGroupNames(): string[];
    getRobotGroupWithName(name: string): RobotGroup | undefined;
    addRobotGroup(robotGroup: RobotGroup): void;
    removeRobotGroup(robotGroupToRemove: RobotGroup): void;
}
