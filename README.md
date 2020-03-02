# robotkit-rom

**robokit-rom** is a library for developing remote operation mode (ROM) robot skills. It is used by the [Robocommander](https://github.com/wwlib/robocommander) Electron app.

## Main Components/Classes

### Rom Classes
**IRomApp**
- an Interface to be implemented by a Rom host app to provide global config info

**Hub**
- per-robot action/skill controller
- manages Skill instances
- routes events to the appropriate Skill instance

**Skill**
- handles interactions for a specific intent. i.e. The Clock skill handles requests for the current time
- associated with a specific robot

**EnsembleSkill**
- handles interactions for a specific intent. i.e.
- NOT associated with a specific robot
- coordinates the actions of a group of robots

**RomCommand**
- a command object that can be serialized and sent to a remotely controlled robot

**RomCommands**
- a collection of pre-defined RomCommand objects that can be prented in a UI and easily triggered and sent to a remotely controlled robot


## Robot Classes

**Robot**
- per-robot controller
- has a RobotConnection used to send remote control commands to connected a robot

**Robots**
- a collection of all Robot objects that can be remotely controled

**RobotGroup**
- a group (subset) of Robot objects that can be remotely controled

**RobotGroups**
- a collection of RobotGroup objects

**RobotConnection**
- per-robot socket connection controller

### NLU Classes

**LUIS**
- LUISController.ts

**Dialogflow**
- DialogflowControllerV2.ts

### Graph Classes

**Neo4j**
- Ne4jController

## project setup

### jest setup

- https://jestjs.io/docs/en/getting-started

```
npm install --save-dev jest typescript ts-jest @types/jest
npx ts-jest config:init
```

### jupyter setup

iTypeScript
```
$ npm install -g typescript
$ npm install -g itypescript
$ its --install=local
$ its

jupyter kernelspec list

jupyter kernelspec uninstall [itypescript]

```


