/**
 * The Hover plugin follows the mouse and shows a timestamp
 * Note for me:
 * access the  WaveSurfer.js directory
 * install dependencies running: npm install --force
 * build the WaveSurfer.js library by running the build script: npm run build
 */
import BasePlugin, { type BasePluginEvents } from '../base-plugin.js';
export type HoverPluginOptions = {
    lineColor?: string;
    lineWidth?: string | number;
    labelColor?: string;
    labelSize?: string | number;
    labelBackground?: string;
};
declare const defaultOptions: {
    lineWidth: number;
    labelSize: number;
};
export type HoverPluginEvents = BasePluginEvents & {
    hover: [relX: number];
};
declare class HoverPlugin extends BasePlugin<HoverPluginEvents, HoverPluginOptions> {
    protected options: HoverPluginOptions & typeof defaultOptions;
    private wrapper;
    private label;
    private unsubscribe;
    private horizontalLine;
    private freq_label;
    private spectrogramContainer;
    constructor(options?: HoverPluginOptions);
    static create(options?: HoverPluginOptions): HoverPlugin;
    private addUnits;
    /** Called by wavesurfer, don't call manually */
    onInit(): void;
    private formatTime;
    private frequencyToNoteAndCents;
    private onPointerMove;
    private onPointerLeave;
    /** Unmount */
    destroy(): void;
}
export default HoverPlugin;
