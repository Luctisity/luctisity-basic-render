import { 
    ActionExecuteMode,
    EventManager, EVENT_PROCESS, EVENT_START, EVENT_TASK_FINISHED, 
    EVOUT_NODE_ASK, 
    EVOUT_NODE_SAY, EVOUT_PLAY_SOUND, EVOUT_STOP_ALL_SOUNDS, EVOUT_TASK_SCHEDULED, LuctisityCore, Task 
} from "luctisity-basic-core";
import AudioManager from "../audio/audioManager";
import RenderManager from "../rendering/renderManager";

const taskMethods: any = {

    // default method
    else: (eventIn: EventManager, task: Task) => {
        eventIn.emit(EVENT_TASK_FINISHED, task);
    },

    wait: (eventIn: EventManager, task: Task) => {
        setTimeout(() => {
            eventIn.emit(EVENT_TASK_FINISHED, task);
        }, task.data.duration * 1000);
    }

}

export default class CommunicationManager {

    core:          LuctisityCore;
    renderManager: RenderManager;
    audioManager:  AudioManager;

    constructor (core: LuctisityCore, renderManager: RenderManager, audioManager: AudioManager) {
        this.core          = core;
        this.renderManager = renderManager;
        this.audioManager  = audioManager;

        this.initOutEvents();

        this.core.events.in.connect(EVENT_START, () => {
            this.core.actions.queueAction({
                type: 'wait',
                target: 'testObject',
                executeMode: ActionExecuteMode.TASK,
                duration: 2
            });
            this.core.actions.queueAction({
                type: 'play',
                target: 'testObject',
                executeMode: ActionExecuteMode.INSTANT,
                sound: 'fart'
            });
            this.core.actions.queueAction({
                type: 'wait',
                target: 'testObject',
                executeMode: ActionExecuteMode.TASK,
                duration: 1
            });
            this.core.actions.queueAction({
                type: 'say',
                target: 'testObject',
                executeMode: ActionExecuteMode.INSTANT,
                content: 'fart'
            });
            this.core.actions.executeActions();
        })
    }

    start () {
        this.core.events.in.emit(EVENT_START);
    }

    process (delta: number) {
        this.core.events.in.emit(EVENT_PROCESS, delta);
    }

    initOutEvents () {
        const out = this.core.events.out;

        out.connect(EVOUT_TASK_SCHEDULED, (task: Task) => {
            const method = taskMethods[task.type] || taskMethods.else;
            method(this.core.events.in, task);
        });

        out.connect(EVOUT_NODE_SAY, (target: any, content: string) => {
            console.log(target, EVOUT_NODE_SAY);
            alert(content);
        });

        out.connect(EVOUT_NODE_ASK, (target: any, content: string) => {
            console.log(target, EVOUT_NODE_ASK);
            prompt(content);
        });

        out.connect(EVOUT_PLAY_SOUND, (target: any, sound: any, mode: number) => {
            console.log(target, sound, EVOUT_PLAY_SOUND);

            if (mode == 0 || mode == 1) this.audioManager.playSound("fart");
            else if (mode == 2)         this.audioManager.playSoundLoop("fart");
            else if (mode == 3)         this.audioManager.stopSound("fart");
        });

        out.connect(EVOUT_STOP_ALL_SOUNDS, (target: any) => {
            console.log(target, EVOUT_STOP_ALL_SOUNDS);
            this.audioManager.stopAllSounds();
        });

    }

}