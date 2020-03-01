"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ActivityParser {
    constructor(data) {
        this.nodeMap = new Map();
        this.linkMap = new Map();
        this.events = [];
        data.nodes.forEach((node) => {
            this.nodeMap.set(node.id, node);
        });
        data.links.forEach((link) => {
            this.linkMap.set(link.id, link);
            let startNode = this.nodeMap.get(link.startNode);
            let endNode = this.nodeMap.get(link.endNode);
            let activityEvent = {
                robot: startNode.properties.name,
                time: link.properties.time,
                action: link.type,
                intent: '',
                user: link.properties.user,
                summary: ''
            };
            if (endNode.labels[0] == 'Intent') {
                activityEvent.intent = endNode.properties.name;
            }
            switch (activityEvent.intent) {
                case 'launchJoke':
                    activityEvent.summary = `I told a joke to ${activityEvent.user}`;
                    break;
                case 'launchClock':
                    activityEvent.summary = `I told ${activityEvent.user} the time`;
                    break;
            }
            this.events.push(activityEvent);
        });
    }
}
exports.default = ActivityParser;
//# sourceMappingURL=ActivityParser.js.map