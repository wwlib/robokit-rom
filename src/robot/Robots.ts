import { EventEmitter } from "events";
import IRomApp from '../rom/IRomApp';
import Robot, { RobotIntent, RobotType } from './Robot';
import RobokitRobot from './RobokitRobot';

export default class Robots extends EventEmitter {

    private _robotMap: Map<string, Robot>;

    public lastUpdateTime: number = 0;
    public statusMessages: string;

    private _robotUpdatedHandler: any = this.onRobotUpdated.bind(this);
    private _robotStatusMessageUpdateHandler: any = this.onRobotStatusMessage.bind(this);
    private _robotIntentHandler: any = this.onRobotIntent.bind(this);

    constructor() {
        super();
        this._robotMap = new Map<string, Robot>();
        this.statusMessages = '';
    }

    initWithData(dataList: any[]): void {
        dataList.forEach((data: any) => {
            let robot: Robot;
            if (data.type == RobotType.robokit) {
                console.log(`Robots: initWithData: new RobokitRobot()`);
                robot = new RobokitRobot();
            } else {
                robot = new Robot();
            }
            robot.initWithData(data);
            this.addRobot(robot);
        })
    }

    onRobotUpdated(robot: Robot): void {
        this.emit('updateRobots', this);
    }


    onRobotStatusMessage(payload: any): void {
        if (payload && payload.message && payload.subsystem) {
            this.updateRobotsStatusMessages(payload.message, payload.subsystem);
        }
    }

    onRobotIntent(robotIntent: RobotIntent): void {
        this.emit('robotIntent', robotIntent);
    }

    updateRobotsStatusMessages(message: string, subsystem?: string, clearMessages: boolean = false): string {
        subsystem = subsystem || '';
        if (clearMessages) {
            this.statusMessages = '';
        } else {
            if (this.statusMessages) {
                this.statusMessages = `${this.statusMessages}\n${subsystem}: ${message}`;
            } else {
                this.statusMessages = `${subsystem}: ${message}`;
            }
        }
        this.emit('updateRobots', this);
        return this.statusMessages;
    }

    get json(): any {
        let json: any[] = [];
        this.robotList.forEach((robot: Robot) => {
            json.push(robot.json);
        });
        return json;
    }

    get robotNames(): string[] {
        const names: string[] = Array.from(this._robotMap.keys());
        return names;
    }

    get connectedRobots(): Robot[] {
        let result: Robot[] = [];
        this.robotList.forEach((robot: Robot) => {
            if (robot.connected) {
                result.push(robot);
            }
        });
        return result;
    }

    get targetedRobots(): Robot[] {
        let result: Robot[] = [];
        this.robotList.forEach((robot: Robot) => {
            if (robot.targeted) {
                result.push(robot);
            }
        });
        return result;
    }

    get robotCount(): number {
        return this.robotList.length;
    }

    getRobotWithName(name: string): Robot | undefined {
        return this._robotMap.get(name);
    }
    get robotList(): Robot[] {
        const robotList: Robot[] = Array.from(this._robotMap.values());
        return robotList;
    }

    getRobotListWithNames(names: string[]): Robot[] | undefined {
        let result: Robot[] | undefined = undefined;
        if (names && names.length > 0) {
            names.forEach((name: string) => {
                const robot: Robot | undefined = this._robotMap.get(name);
                if (robot) {
                    if (!result) {
                        result = [];
                    }
                    result.push(robot);
                }
            });
        }
        return result;
    }

    connectRobot(robot: Robot, romApp: IRomApp): void {
        robot.connect(romApp);
    }

    disconnectRobot(robot: Robot): void {
        robot.disconnect();
    }

    addRobot(robot: Robot): void {
        this._robotMap.set(robot.name, robot);
        robot.on('updateRobot', this._robotUpdatedHandler);
        robot.on('statusMessage', this._robotStatusMessageUpdateHandler);
        robot.on('robotIntent', this._robotIntentHandler);
        this.emit('updateRobots', this);
    }

    removeRobot(robotToRemove: Robot): void {
        if (robotToRemove && robotToRemove.name) {
            robotToRemove.removeListener('updateRobot', this._robotUpdatedHandler);
            robotToRemove.removeListener('statusMessage', this._robotStatusMessageUpdateHandler);
            robotToRemove.removeListener('robotIntent', this._robotIntentHandler);
            this._robotMap.delete(name);
            this.emit('updateRobots', this);
        }

    }

    onUpdateStats(robot: Robot): void {
        this.lastUpdateTime = new Date().getTime();
        this.emit('updateStats', this);
    }

    getNextRobotInRobotList(robot: Robot): Robot | undefined {
        let result: Robot | undefined = undefined;
        const robotNames: string[] = this.robotNames;
        if (robot && robotNames && robotNames.length > 0) {
            robotNames.sort();
            let index: number = robotNames.indexOf(robot.name);
            if (index >= 0 && index < robotNames.length - 1) {
                const nextName: string = robotNames[index + 1];
                const nextRobot: Robot | undefined = this._robotMap.get(nextName);
                if (nextRobot) {
                    result = nextRobot;
                }
            }
        }
        return result;
    }
}
