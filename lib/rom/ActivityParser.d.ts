export declare type ActivityEvent = {
    robot: string;
    time: Date;
    action: string;
    intent: string;
    user: string;
    summary: string;
};
export default class ActivityParser {
    nodeMap: Map<number, any>;
    linkMap: Map<number, any>;
    events: ActivityEvent[];
    constructor(data: any);
}
