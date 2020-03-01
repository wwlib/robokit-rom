import Robot, { RobotIntentData } from '../robot/Robot';
export default abstract class Skill {
    robot: Robot | undefined;
    id: string;
    launchIntent: string;
    running: boolean;
    constructor(robot: Robot | undefined, id: string, launchIntent: string);
    abstract launch(data?: RobotIntentData): void;
    abstract tick(frameTime: number, elapsedTime: number): void;
}
