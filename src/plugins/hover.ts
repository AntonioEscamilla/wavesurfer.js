/**
 * The Hover plugin follows the mouse and shows a timestamp
 * Note for me: 
 * access the  WaveSurfer.js directory
 * install dependencies running: npm install --force
 * build the WaveSurfer.js library by running the build script: npm run build
 */

import BasePlugin, { type BasePluginEvents } from '../base-plugin.js'
import createElement from '../dom.js'

export type HoverPluginOptions = {
  lineColor?: string
  lineWidth?: string | number
  labelColor?: string
  labelSize?: string | number
  labelBackground?: string
}

const defaultOptions = {
  lineWidth: 1,
  labelSize: 11,
}

export type HoverPluginEvents = BasePluginEvents & {
  hover: [relX: number]
}

class HoverPlugin extends BasePlugin<HoverPluginEvents, HoverPluginOptions> {
  protected options: HoverPluginOptions & typeof defaultOptions
  private wrapper: HTMLElement
  private label: HTMLElement
  private unsubscribe: () => void = () => undefined
  // Declare horizontalLine property
  private horizontalLine: HTMLElement 
  private freq_label: HTMLElement
  private spectrogramContainer: HTMLElement | null


  constructor(options?: HoverPluginOptions) {
    super(options || {})
    this.options = Object.assign({}, defaultOptions, options)

    // Create the plugin elements
    this.wrapper = createElement('div', { part: 'hover' })
    this.label = createElement('span', { part: 'hover-label' }, this.wrapper)

    // Create the plugin elements
    this.horizontalLine = createElement('div', { part: 'hover' })
    this.freq_label = createElement('span', { part: 'hover-label' }, this.wrapper)

    this.spectrogramContainer = document.querySelector('#spectrogram-container')
  }

  public static create(options?: HoverPluginOptions) {
    return new HoverPlugin(options)
  }

  private addUnits(value: string | number): string {
    const units = typeof value === 'number' ? 'px' : ''
    return `${value}${units}`
  }

  /** Called by wavesurfer, don't call manually */
  onInit() {
    if (!this.wavesurfer) {
      throw Error('WaveSurfer is not initialized')
    }

    const wsOptions = this.wavesurfer.options
    const lineColor = this.options.lineColor || wsOptions.cursorColor || wsOptions.progressColor

    // Vertical line
    Object.assign(this.wrapper.style, {
      position: 'absolute',
      zIndex: 10,
      left: 0,
      top: 0,
      height: '100%',
      pointerEvents: 'none',
      borderLeft: `${this.addUnits(this.options.lineWidth)} solid ${lineColor}`,
      opacity: '0',
      transition: 'opacity .1s ease-in',
    })
    // Timestamp label
    Object.assign(this.label.style, {
      display: 'block',
      backgroundColor: this.options.labelBackground,
      color: this.options.labelColor,
      fontSize: `${this.addUnits(this.options.labelSize)}`,
      transition: 'transform .1s ease-in',
      padding: '2px 3px',
    })

    // Horizontal line
    Object.assign(this.horizontalLine.style, {
      position: 'absolute',
      zIndex: 10,
      left: 0,
      top: 0,
      width: '100%',
      pointerEvents: 'none',
      borderBottom: `${this.addUnits(this.options.lineWidth)} solid ${lineColor}`,
      opacity: '0',
      transition: 'opacity .1s ease-in',
    })

    // Freqstamp label
    Object.assign(this.freq_label.style, {
      display: 'block',
      backgroundColor: this.options.labelBackground,
      color: this.options.labelColor,
      fontSize: `${this.addUnits(this.options.labelSize)}`,
      transition: 'opacity .1s ease-in',
      padding: '2px 3px',
    })

    // Append the wrapper
    const container = this.wavesurfer.getWrapper()
    container.appendChild(this.wrapper)

    // Append the H-line
    container.appendChild(this.horizontalLine)


    // Attach pointer events
    container.addEventListener('pointermove', this.onPointerMove)
    container.addEventListener('pointerleave', this.onPointerLeave)
    container.addEventListener('wheel', this.onPointerMove)
    this.unsubscribe = () => {
      container.removeEventListener('pointermove', this.onPointerMove)
      container.removeEventListener('pointerleave', this.onPointerLeave)
      container.removeEventListener('wheel', this.onPointerLeave)
    }
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const secondsRemainder = Math.floor(seconds) % 60
    const paddedSeconds = `0${secondsRemainder}`.slice(-2)
    return `${minutes}:${paddedSeconds}`
  }

  private frequencyToNoteAndCents(frequency: number) {
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    const name = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const h = Math.round(12 * Math.log2(frequency / C0));
    const octave = Math.floor(h / 12);
    const n = h % 12;
    const note = name[n] + octave;
    const cents = Math.floor(1200 * Math.log2(frequency / (C0 * Math.pow(2, h / 12))));
    return { note, cents };
  }

  private onPointerMove = (e: PointerEvent | WheelEvent) => {
    if (!this.wavesurfer) return

    // Position
    const bbox = this.wavesurfer.getWrapper().getBoundingClientRect()
    const { width } = bbox
    const offsetX = e.clientX - bbox.left
    const relX = Math.min(1, Math.max(0, offsetX / width))
    const posX = Math.min(width - this.options.lineWidth - 1, offsetX)
    this.wrapper.style.transform = `translateX(${posX}px)`
    this.wrapper.style.opacity = '1'
    // Timestamp
    const duration = this.wavesurfer.getDuration() || 0
    this.label.textContent = this.formatTime(duration * relX)
    const labelWidth = this.label.offsetWidth
    this.label.style.transform = posX + labelWidth > width ? `translateX(-${labelWidth + this.options.lineWidth}px)` : ''

    // Position for horizontal line
    const { height } = bbox
    const offsetY = e.clientY - bbox.top;                                 // Calculate mouse position relative to the top of the waveform
    const posY = Math.min(height - this.options.lineWidth - 1, offsetY);  // Adjust positioning for the horizontal line
    
    // Freq label
    const relY = Math.min(1, Math.max(0, (offsetY  - 200) / 300))         // Relative Y position inside the spectrogram between (0, 1)
    if (relY === 0) {
      this.freq_label.textContent = '';                                   // Hide the label by setting an empty string as its content
      this.freq_label.style.display = 'none';                             // Optionally, hide the label by setting its display property to 'none'
      this.horizontalLine.style.opacity = '0';                            // Hide the horizontal line by setting its opacity to 0
    } else {
      const frequency = ((1 - relY) * 22050)
      const { note, cents } = this.frequencyToNoteAndCents(frequency);
      const freq_str = frequency.toFixed(0);
      this.freq_label.textContent = `${freq_str} Hz (${note} ${cents}cents)`;
      this.freq_label.style.display = 'block';
      this.horizontalLine.style.transform = `translateY(${posY}px)`;      // Update the position of the horizontal line
      this.horizontalLine.style.opacity = '1'                             // Show the horizontal line by setting its opacity to 1
    }
    const freq_labelWidth = this.freq_label.offsetWidth                   // Calculate label width and check if it would overflow
    const freq_labelHeight = this.freq_label.offsetHeight
    const overflowTranslateX = posX + freq_labelWidth > width ? -freq_labelWidth - this.options.lineWidth : 0;
    this.freq_label.style.transform =  `translate(${overflowTranslateX}px, ${posY - 2*freq_labelHeight}px)`

    // Emit a hover event with the relative X position
    this.emit('hover', relX)
  }

  private onPointerLeave = () => {
    this.wrapper.style.opacity = '0'
    this.horizontalLine.style.opacity = '0'
  }

  /** Unmount */
  public destroy() {
    super.destroy()
    this.unsubscribe()
    this.wrapper.remove()
  }
}

export default HoverPlugin
