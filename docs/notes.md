# Robokit ROM


## Rom Components

### RomAppInfo
- an Interface to be implemented by a Rom host app to provide global config info

### Hub
- per-robot action/skill controller

### RomCommand
- a command object that can be serialized and sent to a remotely controlled robot

### RomCommands
- a collection of pre-defined RomCommand objects that can be prented in a UI and easily triggered and sent to a remotely controlled robot


## Robot Components

### Robot
- per-robot controller
- has a RobotConnection used to send remote control commands to connected a robot

### Robots
- a collection of all Robot objects that can be remotely controled

### RobotGroup
- a group (subset) of Robot objects that can be remotely controled

### RobotGroups
- a collection of RobotGroup objects

### RobotConnection
- per-robot socket connection controller

## NLU Components

### LUIS
- LUISController.ts

### Dialogflow
- DialogflowControllerV2.ts

## Graph Components

### Neo4j
- Neo4jController.ts


