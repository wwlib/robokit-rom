import Skill from './Skill';
import Robot, { RobotIntentData } from '../robot/Robot';
export default class UserLikesSkill extends Skill {
    constructor(robot: Robot);
    launch(data: RobotIntentData): void;
    tick(frameTime: number, elapsedTime: number): void;
}
