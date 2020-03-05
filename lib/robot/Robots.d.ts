/// <reference types="node" />
import { EventEmitter } from "events";
import IRomApp from '../rom/IRomApp';
import Robot, { RobotIntent } from './Robot';
export default class Robots extends EventEmitter {
    robotList: Robot[];
    robotMap: Map<string, Robot>;
    lastUpdateTime: number;
    statusMessages: string;
    private _robotUpdatedHandler;
    private _robotStatusMessageUpdateHandler;
    private _robotIntentHandler;
    constructor();
    initWithData(dataList: any[]): void;
    onRobotUpdated(robot: Robot): void;
    onRobotStatusMessage(payload: any): void;
    onRobotIntent(robotIntent: RobotIntent): void;
    updateRobotsStatusMessages(message: string, subsystem?: string, clearMessages?: boolean): string;
    get json(): any;
    get robotNames(): string[];
    get connectedRobots(): Robot[];
    get targetedRobots(): Robot[];
    get robotCount(): number;
    getRobotWithName(name: string): Robot | undefined;
    connectRobot(robot: Robot, romApp: IRomApp): void;
    disconnectRobot(robot: Robot): void;
    addRobot(robot: Robot): void;
    removeRobot(robotToRemove: Robot): void;
    onUpdateStats(robot: Robot): void;
    getNextRobotInRobotList(robot: Robot): Robot;
}
