/* Gravity's geometric wordmark sequence: trace, fill, assemble, hold, release. */
(() => {
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { const x = clamp(n); return x*x*(3-2*x); };
  const colors = ['#dbac55', '#b8584f', '#5592bd', '#f0cf83'];
  class GravityMotion extends HTMLElement {
    connectedCallback() {
      this.innerHTML = '<canvas aria-hidden="true"></canvas>';
      this.canvas = this.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.time = 0;
      this.visible = true;
      this.last = 0;
      this.tiles = [];
      const mask = document.createElement('canvas');
      mask.width = 760; mask.height = 320;
      const ink = mask.getContext('2d');
      ink.font = 'bold 100px Georgia, serif';
      ink.textAlign = 'center'; ink.textBaseline = 'middle';
      ink.fillText('GRAVITY', 380, 155);
      const pixels = ink.getImageData(0, 0, 760, 320).data;
      let seed = 91;
      const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (let y = 102; y < 209; y += 5) for (let x = 90; x < 675; x += 5) {
        if (pixels[(y*760+x)*4+3] < 80) continue;
        this.tiles.push({x, y, sx:50+Math.floor(random()*22)*30, sy:25+Math.floor(random()*9)*30, delay:random()*.65, color:colors[Math.floor(random()*4)], size:8+random()*12});
      }
      this.cells = Array.from({length:45}, () => ({x:30+Math.floor(random()*22)*30, y:10+Math.floor(random()*9)*30, w:(1+Math.floor(random()*3))*30, h:(1+Math.floor(random()*3))*30, color:colors[Math.floor(random()*4)], delay:random()*2}));
      this.frame = now => {
        this.raf = 0;
        if (!this.isConnected) return;
        if (this.last && this.visible && !document.hidden) this.time += (now-this.last)/1000;
        this.last = now;
        this.draw(this.time % 18);
        if (this.visible && !document.hidden) this.raf = requestAnimationFrame(this.frame);
      };
      this.wake = () => { if (this.raf) cancelAnimationFrame(this.raf); this.last = 0; this.raf = requestAnimationFrame(this.frame); };
      document.addEventListener('visibilitychange',this.wake);
      this.resize = new ResizeObserver(() => {
        const scale = Math.min(devicePixelRatio || 1,2);
        this.canvas.width = Math.max(1, Math.round(this.clientWidth*scale));
        this.canvas.height = Math.max(1, Math.round(this.clientHeight*scale));
        this.draw(this.time%18);
      });
      this.resize.observe(this);
      this.intersection = new IntersectionObserver(entries => { this.visible=entries[0].isIntersecting; this.wake(); });
      this.intersection.observe(this);
      this.wake();
    }
    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      this.resize?.disconnect(); this.intersection?.disconnect();
      document.removeEventListener('visibilitychange',this.wake);
    }
    draw(t) {
      const c=this.ctx;
      if (!c) return;
      c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,this.canvas.width,this.canvas.height);
      // Fit the full wordmark at every width, without cropping any letters.
      const s=Math.min(this.canvas.width/760,this.canvas.height/320);
      c.setTransform(s,0,0,s,(this.canvas.width-760*s)/2,(this.canvas.height-320*s)/2);
      const assemble=ease((t-5)/4), release=ease((t-14)/4);
      const resolved=assemble*(1-release);
      const solid=ease((t-9)/1.4)*(1-ease((t-13.5)/1.5));
      // Architectural outlines emerge before the colored square tiles.
      for (const cell of this.cells) {
        const traced=ease((t-cell.delay)/2)*(1-.7*resolved);
        c.strokeStyle=cell.color; c.lineWidth=.8; c.globalAlpha=.38*traced;
        c.strokeRect(cell.x,cell.y,cell.w,cell.h);
        c.globalAlpha=.22*ease((t-2-cell.delay)/2)*(1-resolved)*(1-release);
        c.fillStyle=cell.color; c.fillRect(cell.x,cell.y,cell.w,cell.h);
        c.globalAlpha=.58*traced*(1-resolved);
        c.beginPath(); c.moveTo(cell.x,cell.y); c.lineTo(cell.x+cell.w*ease((t-cell.delay)/3),cell.y); c.stroke();
      }
      // Colored squares travel along right-angle paths and become the letterforms.
      for (const tile of this.tiles) {
        const a=ease((t-5-tile.delay)/3.6)*(1-release);
        const x=tile.sx+(tile.x-tile.sx)*ease(a*1.45);
        const y=tile.sy+(tile.y-tile.sy)*ease((a-.18)/.82);
        const size=tile.size+(5.5-tile.size)*a;
        c.globalAlpha=(.07+.88*a)*ease((t-2-tile.delay)/2)*(1-.95*solid)*(1-.85*release);
        c.fillStyle=tile.color; c.fillRect(x,y,size,size);
      }
      // The assembled tiles settle into a crisp Gravity wordmark.
      c.globalAlpha=solid;
      const gold=c.createLinearGradient(160,110,610,205);
      gold.addColorStop(0,'#f5d995');gold.addColorStop(.5,'#d5a44d');gold.addColorStop(1,'#fff0c8');
      c.fillStyle=gold; c.font='bold 100px Georgia, serif'; c.textAlign='center';c.textBaseline='middle';
      c.shadowColor='#d9ad5e';c.shadowBlur=14*solid;
      c.fillText('GRAVITY',380,155);c.shadowBlur=0;
      c.globalAlpha=.8*solid; c.fillStyle='#e8d9ba';c.font='16px system-ui, sans-serif';
      c.fillText('S O P   F O U N D R Y',380,226);
      c.globalAlpha=1;
    }
  }
  customElements.define('gravity-motion',GravityMotion);
})();
