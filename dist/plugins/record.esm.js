function t(t,i,e,s){return new(e||(e=Promise))((function(r,o){function n(t){try{d(s.next(t))}catch(t){o(t)}}function a(t){try{d(s.throw(t))}catch(t){o(t)}}function d(t){var i;t.done?r(t.value):(i=t.value,i instanceof e?i:new e((function(t){t(i)}))).then(n,a)}d((s=s.apply(t,i||[])).next())}))}"function"==typeof SuppressedError&&SuppressedError;class i{constructor(){this.listeners={}}on(t,i,e){if(this.listeners[t]||(this.listeners[t]=new Set),this.listeners[t].add(i),null==e?void 0:e.once){const e=()=>{this.un(t,e),this.un(t,i)};return this.on(t,e),e}return()=>this.un(t,i)}un(t,i){var e;null===(e=this.listeners[t])||void 0===e||e.delete(i)}once(t,i){return this.on(t,i,{once:!0})}unAll(){this.listeners={}}emit(t,...i){this.listeners[t]&&this.listeners[t].forEach((t=>t(...i)))}}class e extends i{constructor(t){super(),this.subscriptions=[],this.options=t}onInit(){}_init(t){this.wavesurfer=t,this.onInit()}destroy(){this.emit("destroy"),this.subscriptions.forEach((t=>t()))}}class s extends i{constructor(){super(...arguments),this.unsubscribe=()=>{}}start(){this.unsubscribe=this.on("tick",(()=>{requestAnimationFrame((()=>{this.emit("tick")}))})),this.emit("tick")}stop(){this.unsubscribe()}destroy(){this.unsubscribe()}}const r=["audio/webm","audio/wav","audio/mpeg","audio/mp4","audio/mp3"];class o extends e{constructor(t){var i,e,r,o;super(Object.assign(Object.assign({},t),{audioBitsPerSecond:null!==(i=t.audioBitsPerSecond)&&void 0!==i?i:128e3,scrollingWaveform:null!==(e=t.scrollingWaveform)&&void 0!==e&&e,scrollingWaveformWindow:null!==(r=t.scrollingWaveformWindow)&&void 0!==r?r:5,renderRecordedAudio:null===(o=t.renderRecordedAudio)||void 0===o||o})),this.stream=null,this.mediaRecorder=null,this.dataWindow=null,this.isWaveformPaused=!1,this.lastStartTime=0,this.lastDuration=0,this.duration=0,this.timer=new s,this.subscriptions.push(this.timer.on("tick",(()=>{const t=performance.now()-this.lastStartTime;this.duration=this.isPaused()?this.duration:this.lastDuration+t,this.emit("record-progress",this.duration)})))}static create(t){return new o(t||{})}renderMicStream(t){const i=new AudioContext,e=i.createMediaStreamSource(t),s=i.createAnalyser();e.connect(s);const r=s.frequencyBinCount,o=new Float32Array(r);let n;const a=Math.floor((this.options.scrollingWaveformWindow||0)*i.sampleRate),d=()=>{var t;if(this.isWaveformPaused)return void(n=requestAnimationFrame(d));if(s.getFloatTimeDomainData(o),this.options.scrollingWaveform){const t=Math.min(a,this.dataWindow?this.dataWindow.length+r:r),i=new Float32Array(a);if(this.dataWindow){const e=Math.max(0,a-this.dataWindow.length);i.set(this.dataWindow.slice(-t+r),e)}i.set(o,a-r),this.dataWindow=i}else this.dataWindow=o;const i=this.options.scrollingWaveformWindow;this.wavesurfer&&(null!==(t=this.originalOptions)&&void 0!==t||(this.originalOptions={cursorWidth:this.wavesurfer.options.cursorWidth,interact:this.wavesurfer.options.interact}),this.wavesurfer.options.cursorWidth=0,this.wavesurfer.options.interact=!1,this.wavesurfer.load("",[this.dataWindow],i)),n=requestAnimationFrame(d)};return d(),{onDestroy:()=>{cancelAnimationFrame(n),null==e||e.disconnect(),null==i||i.close()},onEnd:()=>{this.isWaveformPaused=!0,cancelAnimationFrame(n),this.stopMic()}}}startMic(i){return t(this,void 0,void 0,(function*(){let t;try{t=yield navigator.mediaDevices.getUserMedia({audio:!(null==i?void 0:i.deviceId)||{deviceId:i.deviceId}})}catch(t){throw new Error("Error accessing the microphone: "+t.message)}const{onDestroy:e,onEnd:s}=this.renderMicStream(t);return this.subscriptions.push(this.once("destroy",e)),this.subscriptions.push(this.once("record-end",s)),this.stream=t,t}))}stopMic(){this.stream&&(this.stream.getTracks().forEach((t=>t.stop())),this.stream=null,this.mediaRecorder=null)}startRecording(i){return t(this,void 0,void 0,(function*(){const t=this.stream||(yield this.startMic(i));this.dataWindow=null;const e=this.mediaRecorder||new MediaRecorder(t,{mimeType:this.options.mimeType||r.find((t=>MediaRecorder.isTypeSupported(t))),audioBitsPerSecond:this.options.audioBitsPerSecond});this.mediaRecorder=e,this.stopRecording();const s=[];e.ondataavailable=t=>{t.data.size>0&&s.push(t.data)};const o=t=>{var i;const r=new Blob(s,{type:e.mimeType});this.emit(t,r),this.options.renderRecordedAudio&&(this.applyOriginalOptionsIfNeeded(),null===(i=this.wavesurfer)||void 0===i||i.load(URL.createObjectURL(r)))};e.onpause=()=>o("record-pause"),e.onstop=()=>o("record-end"),e.start(),this.lastStartTime=performance.now(),this.lastDuration=0,this.duration=0,this.isWaveformPaused=!1,this.timer.start(),this.emit("record-start")}))}getDuration(){return this.duration}isRecording(){var t;return"recording"===(null===(t=this.mediaRecorder)||void 0===t?void 0:t.state)}isPaused(){var t;return"paused"===(null===(t=this.mediaRecorder)||void 0===t?void 0:t.state)}isActive(){var t;return"inactive"!==(null===(t=this.mediaRecorder)||void 0===t?void 0:t.state)}stopRecording(){var t;this.isActive()&&(null===(t=this.mediaRecorder)||void 0===t||t.stop(),this.timer.stop())}pauseRecording(){var t,i;this.isRecording()&&(this.isWaveformPaused=!0,null===(t=this.mediaRecorder)||void 0===t||t.requestData(),null===(i=this.mediaRecorder)||void 0===i||i.pause(),this.timer.stop(),this.lastDuration=this.duration)}resumeRecording(){var t;this.isPaused()&&(this.isWaveformPaused=!1,null===(t=this.mediaRecorder)||void 0===t||t.resume(),this.timer.start(),this.lastStartTime=performance.now(),this.emit("record-resume"))}static getAvailableAudioDevices(){return t(this,void 0,void 0,(function*(){return navigator.mediaDevices.enumerateDevices().then((t=>t.filter((t=>"audioinput"===t.kind))))}))}destroy(){this.applyOriginalOptionsIfNeeded(),super.destroy(),this.stopRecording(),this.stopMic()}applyOriginalOptionsIfNeeded(){this.wavesurfer&&this.originalOptions&&(this.wavesurfer.options.cursorWidth=this.originalOptions.cursorWidth,this.wavesurfer.options.interact=this.originalOptions.interact,delete this.originalOptions)}}export{o as default};
