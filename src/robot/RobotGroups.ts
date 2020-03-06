import RobotGroup from './RobotGroup';

export default class RobotGroups {

    public robotGroupsMap: Map<string, RobotGroup>;

    constructor() {
        this.robotGroupsMap = new Map<string, RobotGroup>();
    }

    initWithData(dataList: any[]): void {
        if (dataList) {
            dataList.forEach((data: any) => {
                let robotGroup: RobotGroup = new RobotGroup();
                robotGroup.initWithData(data);
                this.addRobotGroup(robotGroup);
            });
        }
    }

    get json(): any[] {
        let json: any[] = [];
        let groups: RobotGroup[] = Array.from(this.robotGroupsMap.values());
        groups.forEach(robotGroup => {
            json.push(robotGroup.json);
        });
        return json;
    }

    get robotGroupNames(): string[] {
        let names: string[] = Array.from(this.robotGroupsMap.keys());
        names.sort();
        return names;
    }

    getRobotGroupWithName(name: string): RobotGroup | undefined {
        return this.robotGroupsMap.get(name);
    }

    addRobotGroup(robotGroup: RobotGroup): void {
        this.robotGroupsMap.set(robotGroup.name, robotGroup);        
    }

    removeRobotGroup(robotGroupToRemove: RobotGroup): void {
        this.robotGroupsMap.delete(robotGroupToRemove.name);
    }
}
