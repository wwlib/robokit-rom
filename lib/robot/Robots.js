"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Robot_1 = require("./Robot");
const RobokitRobot_1 = require("./RobokitRobot");
class Robots extends events_1.EventEmitter {
    constructor() {
        super();
        this.lastUpdateTime = 0;
        this._robotUpdatedHandler = this.onRobotUpdated.bind(this);
        this._robotStatusMessageUpdateHandler = this.onRobotStatusMessage.bind(this);
        this._robotIntentHandler = this.onRobotIntent.bind(this);
        this._robotMap = new Map();
        this.statusMessages = '';
    }
    initWithData(dataList) {
        dataList.forEach((data) => {
            let robot;
            if (data.type == Robot_1.RobotType.robokit) {
                // console.log(`Robots: initWithData: new RobokitRobot()`);
                robot = new RobokitRobot_1.default();
            }
            else {
                robot = new Robot_1.default();
            }
            robot.initWithData(data);
            this.addRobot(robot);
        });
    }
    onRobotUpdated(robot) {
        this.emit('updateRobots', this);
    }
    onRobotStatusMessage(payload) {
        if (payload && payload.message && payload.subsystem) {
            this.updateRobotsStatusMessages(payload.message, payload.subsystem);
        }
    }
    onRobotIntent(robotIntent) {
        this.emit('robotIntent', robotIntent);
    }
    updateRobotsStatusMessages(message, subsystem, clearMessages = false) {
        subsystem = subsystem || '';
        if (clearMessages) {
            this.statusMessages = '';
        }
        else {
            if (this.statusMessages) {
                this.statusMessages = `${this.statusMessages}\n${subsystem}: ${message}`;
            }
            else {
                this.statusMessages = `${subsystem}: ${message}`;
            }
        }
        this.emit('updateRobots', this);
        return this.statusMessages;
    }
    get json() {
        let json = [];
        this.robotList.forEach((robot) => {
            json.push(robot.json);
        });
        return json;
    }
    get robotNames() {
        const names = Array.from(this._robotMap.keys());
        return names;
    }
    get robotStates() {
        const names = Array.from(this._robotMap.keys());
        const states = {};
        names.forEach((name) => {
            const robot = this.getRobotWithName(name);
            if (robot) {
                states[name] = robot.stateName;
            }
        });
        return states;
    }
    get connectedRobots() {
        let result = [];
        this.robotList.forEach((robot) => {
            if (robot.connected) {
                result.push(robot);
            }
        });
        return result;
    }
    get targetedRobots() {
        let result = [];
        this.robotList.forEach((robot) => {
            if (robot.targeted) {
                result.push(robot);
            }
        });
        return result;
    }
    get robotCount() {
        return this.robotList.length;
    }
    getRobotWithName(name) {
        return this._robotMap.get(name);
    }
    get robotList() {
        const robotList = Array.from(this._robotMap.values());
        return robotList;
    }
    getRobotListWithNames(names) {
        let result = undefined;
        if (names && names.length > 0) {
            names.forEach((name) => {
                const robot = this._robotMap.get(name);
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
    connectRobot(robot, romApp) {
        robot.connect(romApp);
    }
    disconnectRobot(robot) {
        robot.disconnect();
    }
    addRobot(robot) {
        this._robotMap.set(robot.name, robot);
        robot.on('updateRobot', this._robotUpdatedHandler);
        robot.on('statusMessage', this._robotStatusMessageUpdateHandler);
        robot.on('robotIntent', this._robotIntentHandler);
        this.emit('updateRobots', this);
    }
    removeRobot(robotToRemove) {
        if (robotToRemove && robotToRemove.name) {
            robotToRemove.removeListener('updateRobot', this._robotUpdatedHandler);
            robotToRemove.removeListener('statusMessage', this._robotStatusMessageUpdateHandler);
            robotToRemove.removeListener('robotIntent', this._robotIntentHandler);
            this._robotMap.delete(name);
            this.emit('updateRobots', this);
        }
    }
    onUpdateStats(robot) {
        this.lastUpdateTime = new Date().getTime();
        this.emit('updateStats', this);
    }
    getNextRobotInRobotList(robot) {
        let result = undefined;
        const robotNames = this.robotNames;
        if (robot && robotNames && robotNames.length > 0) {
            robotNames.sort();
            let index = robotNames.indexOf(robot.name);
            if (index >= 0 && index < robotNames.length - 1) {
                const nextName = robotNames[index + 1];
                const nextRobot = this._robotMap.get(nextName);
                if (nextRobot) {
                    result = nextRobot;
                }
            }
        }
        return result;
    }
    status() {
        return {
            count: this.robotCount,
            names: this.robotNames,
        };
    }
}
exports.default = Robots;
//# sourceMappingURL=Robots.js.map