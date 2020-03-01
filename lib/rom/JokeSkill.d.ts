import Skill from './Skill';
import Robot, { RobotIntentData } from '../robot/Robot';
export declare type Joke = {
    id: string;
    name: string;
    prompt: string;
};
export default class JokeSkill extends Skill {
    jokeMap: Map<string, Joke>;
    jokeIterator: Iterator<Joke>;
    constructor(robot: Robot);
    initJokes(): void;
    launch(data: RobotIntentData): void;
    tick(frameTime: number, elapsedTime: number): void;
}
