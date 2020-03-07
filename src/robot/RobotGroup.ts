// import { Robot } from './Robot';

export default class RobotGroup {

    private _name: string;
    private _robotNames: string[];

    constructor(name?: string) {
        this._name = name || '';
        this._robotNames = [];
    }

    // { "name": "Team A", "robots": ["salt", "maize"]}

    initWithData(data: any): void {
        if (data && data.name && data.robots) {
            this._name = data.name;
            let robotNames: string[] = data.robots;
            robotNames.forEach((robotName: string) => {
                this._robotNames.push(robotName);
            });
        }
    }

    get name(): string {
        return this._name;
    }

    get json(): any {
        let json: any = {
            name: this.name,
            robots:  this._robotNames,
        };
        return json;
    }

    get robotNames(): string[] {
        return this._robotNames;
    }

    addRobotName(name: string): void {
        this._robotNames.push(name);
    }

    removeRobotName(robotNameToRemove: string): void {
        let tempRobotList: string[] = [];
        this._robotNames.forEach((robotName: string) => {
            if (robotName != robotNameToRemove) {
                tempRobotList.push(robotName);
            }
        });
    }
}
