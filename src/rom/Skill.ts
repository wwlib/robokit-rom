import Robot, { RobotIntentData } from '../robot/Robot';

export default abstract class Skill {

    public robot: Robot | undefined;
    public id: string;
    public launchIntent: string = '';
    public running: boolean = false;


    constructor(robot: Robot | undefined, id: string, launchIntent: string) {
        this.robot = robot;
        this.id = id;
        this.launchIntent = launchIntent;
    }

    status(): any {
        let robotName: string = '';
        if (this.robot) {
            robotName = this.robot.name;
        }
        return {
            type: 'skill',
            robotName: robotName,
            id: this.id,
            launchIntent: this.launch,
            running: this.running,
        }
    }

    abstract launch(data?: RobotIntentData): void;

    abstract tick(frameTime: number, elapsedTime: number): void;
}
