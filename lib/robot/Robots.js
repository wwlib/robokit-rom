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
        this.robotList = [];
        this.robotMap = new Map();
        this.statusMessages = '';
    }
    initWithData(dataList) {
        dataList.forEach((data) => {
            let robot;
            if (data.type == Robot_1.RobotType.robokit) {
                console.log(`Robots: initWithData: new RobokitRobot()`);
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
        let names = [];
        this.robotList.forEach(robot => {
            names.push(robot.name);
        });
        return names;
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
        return this.robotMap.get(name);
    }
    // enableRobot(robot: Robot, romApp: IRomApp): void {
    //     robot.enabled = true;
    //
    // }
    //
    // disableRobot(robot: Robot): void {
    //     robot.enabled = false;
    // }
    connectRobot(robot, romApp) {
        robot.connect(romApp);
    }
    disconnectRobot(robot) {
        robot.disconnect();
    }
    addRobot(robot) {
        this.robotList.push(robot);
        this.robotMap.set(robot.name, robot);
        robot.on('updateRobot', this._robotUpdatedHandler);
        robot.on('statusMessage', this._robotStatusMessageUpdateHandler);
        robot.on('robotIntent', this._robotIntentHandler);
        this.emit('updateRobots', this);
    }
    removeRobot(robotToRemove) {
        let tempRobotList = [];
        let tempRobotMap = new Map();
        this.robotList.forEach(robot => {
            if (robot != robotToRemove) {
                tempRobotList.push(robot);
                tempRobotMap.set(robot.name, robot);
            }
        });
        this.robotList = tempRobotList;
        this.robotMap = tempRobotMap;
        robotToRemove.removeListener('updateRobot', this._robotUpdatedHandler);
        robotToRemove.removeListener('statusMessage', this._robotStatusMessageUpdateHandler);
        robotToRemove.removeListener('robotIntent', this._robotIntentHandler);
        this.emit('updateRobots', this);
    }
    onUpdateStats(robot) {
        this.lastUpdateTime = new Date().getTime();
        this.emit('updateStats', this);
    }
    getNextRobotInRobotList(robot) {
        let result = this.robotList[0];
        let index = this.robotList.indexOf(robot);
        if (index >= 0 && index < this.robotList.length - 1) {
            result = this.robotList[index + 1];
        }
        return result;
    }
}
exports.default = Robots;
//# sourceMappingURL=Robots.js.map