class t{constructor(){this.listeners={}}on(t,e,i){if(this.listeners[t]||(this.listeners[t]=new Set),this.listeners[t].add(e),null==i?void 0:i.once){const i=()=>{this.un(t,i),this.un(t,e)};return this.on(t,i),i}return()=>this.un(t,e)}un(t,e){var i;null===(i=this.listeners[t])||void 0===i||i.delete(e)}once(t,e){return this.on(t,e,{once:!0})}unAll(){this.listeners={}}emit(t,...e){this.listeners[t]&&this.listeners[t].forEach((t=>t(...e)))}}class e extends t{constructor(t){super(),this.subscriptions=[],this.options=t}onInit(){}_init(t){this.wavesurfer=t,this.onInit()}destroy(){this.emit("destroy"),this.subscriptions.forEach((t=>t()))}}function i(t,e){const s=e.xmlns?document.createElementNS(e.xmlns,t):document.createElement(t);for(const[t,n]of Object.entries(e))if("children"===t)for(const[t,n]of Object.entries(e))"string"==typeof n?s.appendChild(document.createTextNode(n)):s.appendChild(i(t,n));else"style"===t?Object.assign(s.style,n):"textContent"===t?s.textContent=n:s.setAttribute(t,n.toString());return s}function s(t,e,s){const n=i(t,e||{});return null==s||s.appendChild(n),n}const n={lineWidth:1,labelSize:11};class o extends e{constructor(t){super(t||{}),this.unsubscribe=()=>{},this.onPointerMove=t=>{if(!this.wavesurfer)return;const e=this.wavesurfer.getWrapper().getBoundingClientRect(),{width:i}=e,s=t.clientX-e.left,n=Math.min(1,Math.max(0,s/i)),o=Math.min(i-this.options.lineWidth-1,s);this.wrapper.style.transform=`translateX(${o}px)`,this.wrapper.style.opacity="1";const r=this.wavesurfer.getDuration()||0;this.label.textContent=this.formatTime(r*n);const a=this.label.offsetWidth;this.label.style.transform=o+a>i?`translateX(-${a+this.options.lineWidth}px)`:"";const{height:l}=e,h=t.clientY-e.top,p=Math.min(l-this.options.lineWidth-1,h),c=Math.min(1,Math.max(0,(h-200)/300));if(0===c)this.freq_label.textContent="",this.freq_label.style.display="none",this.horizontalLine.style.opacity="0";else{const t=(22050*(1-c)).toFixed(0);this.freq_label.textContent=`${t} Hz`,this.freq_label.style.display="block",this.horizontalLine.style.transform=`translateY(${p}px)`,this.horizontalLine.style.opacity="1"}const d=this.freq_label.offsetWidth,u=this.freq_label.offsetHeight,f=o+d>i?-d-this.options.lineWidth:0;this.freq_label.style.transform=`translate(${f}px, ${p-2*u}px)`,this.emit("hover",n)},this.onPointerLeave=()=>{this.wrapper.style.opacity="0",this.horizontalLine.style.opacity="0"},this.options=Object.assign({},n,t),this.wrapper=s("div",{part:"hover"}),this.label=s("span",{part:"hover-label"},this.wrapper),this.horizontalLine=s("div",{part:"hover"}),this.freq_label=s("span",{part:"hover-label"},this.wrapper),this.spectrogramContainer=document.querySelector("#spectrogram-container")}static create(t){return new o(t)}addUnits(t){return`${t}${"number"==typeof t?"px":""}`}onInit(){if(!this.wavesurfer)throw Error("WaveSurfer is not initialized");const t=this.wavesurfer.options,e=this.options.lineColor||t.cursorColor||t.progressColor;Object.assign(this.wrapper.style,{position:"absolute",zIndex:10,left:0,top:0,height:"100%",pointerEvents:"none",borderLeft:`${this.addUnits(this.options.lineWidth)} solid ${e}`,opacity:"0",transition:"opacity .1s ease-in"}),Object.assign(this.label.style,{display:"block",backgroundColor:this.options.labelBackground,color:this.options.labelColor,fontSize:`${this.addUnits(this.options.labelSize)}`,transition:"transform .1s ease-in",padding:"2px 3px"}),Object.assign(this.horizontalLine.style,{position:"absolute",zIndex:10,left:0,top:0,width:"100%",pointerEvents:"none",borderBottom:`${this.addUnits(this.options.lineWidth)} solid ${e}`,opacity:"0",transition:"opacity .1s ease-in"}),Object.assign(this.freq_label.style,{display:"block",backgroundColor:this.options.labelBackground,color:this.options.labelColor,fontSize:`${this.addUnits(this.options.labelSize)}`,transition:"opacity .1s ease-in",padding:"2px 3px"});const i=this.wavesurfer.getWrapper();i.appendChild(this.wrapper),i.appendChild(this.horizontalLine),i.addEventListener("pointermove",this.onPointerMove),i.addEventListener("pointerleave",this.onPointerLeave),i.addEventListener("wheel",this.onPointerMove),this.unsubscribe=()=>{i.removeEventListener("pointermove",this.onPointerMove),i.removeEventListener("pointerleave",this.onPointerLeave),i.removeEventListener("wheel",this.onPointerLeave)}}formatTime(t){return`${Math.floor(t/60)}:${`0${Math.floor(t)%60}`.slice(-2)}`}destroy(){super.destroy(),this.unsubscribe(),this.wrapper.remove()}}export{o as default};
