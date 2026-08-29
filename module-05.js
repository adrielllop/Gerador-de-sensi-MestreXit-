/* MestreXit Lab - controlador de segurança para cliques/touch */
(function(){
  function bindLab(){
    const page=document.getElementById('mxLabPage');
    if(!page) return;
    const q=s=>page.querySelector(s);
    const intensity=q('#mxIntensity');
    if(intensity && !intensity.dataset.boundFix){
      intensity.dataset.boundFix='1';
      intensity.addEventListener('input',function(){
        const v=q('#mxIntensityVal'),t=q('#mxIntensityText');
        if(v)v.textContent=this.value;if(t)t.textContent=this.value+'%';
      });
    }
    page.addEventListener('click',function(e){
      const problem=e.target.closest('#mxProblems button');
      if(problem){
        e.preventDefault();
        page.querySelectorAll('#mxProblems button').forEach(b=>b.classList.remove('active'));
        problem.classList.add('active');
        return;
      }
      const gen=e.target.closest('#mxGenerate');
      const daily=e.target.closest('#mxDaily');
      const img=e.target.closest('#mxExport');
      if(gen||daily||img){
        e.preventDefault();
        const dpi=Math.max(300,Math.min(1200,Number(q('#mxLabDpi')?.value)||600));
        const fingers=Number(q('#mxFingers')?.value||3);
        const mode=q('#mxMode')?.value||'balanced';
        const device=q('#mxDevice')?.value||'Android básico';
        const inten=Number(q('#mxIntensity')?.value||75);
        const adj={capa:12,rush:16,precision:-8,control:-13,onetap:9,balanced:0}[mode]||0;
        const dadj=device.includes('iPhone')?5:device.includes('gamer')?8:device.includes('básico')?-7:0;
        let g=175+adj+dadj+(fingers-3)*2+(dpi-600)/70+(inten-70)*.35;
        const active=q('#mxProblems button.active');
        const pa=active?.dataset.problem||'';
        g+=({passa:-10,peito:10,lenta:12,rapida:-12,recuo:-6,capa:7}[pa]||0);
        const C=v=>Math.max(1,Math.min(200,Math.round(v)));
        const r={geral:C(g),mira:C(g-12),reddot:C(g-22),x2:C(g-34),x4:C(g-46),sniper:C(g-64),dpi,device,fingers,mode};
        if(daily){const d=new Date();const seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();r.geral=C(160+seed%41);r.mira=C(r.geral-10);r.reddot=C(r.geral-20);r.x2=C(r.geral-32);r.x4=C(r.geral-44);r.sniper=C(r.geral-62);}
        window.__mestreXitLabLast=r;
        const title=daily?'🔥 Sensi do Dia':'🎯 Sensi Gerada pelo MestreXit';
        const rows=[['Geral',r.geral],['Mira',r.mira],['Red Dot',r.reddot],['Mira 2x',r.x2],['Mira 4x',r.x4],['Mira Sniper',r.sniper]].map(x=>`<tr><td>${x[0]}</td><td><b>${x[1]}%</b></td></tr>`).join('');
        const result=q('#mxResult');
        if(result){
          result.innerHTML=`<div class="mxlab-result-head"><div><h2 style="margin:0">${title}</h2><p style="margin:6px 0;color:rgba(255,255,255,.7)">${r.device} • ${r.fingers} dedos • DPI ${r.dpi}</p></div><span class="mxlab-pill">${r.mode.toUpperCase()}</span></div><table class="mxlab-table"><thead><tr><th>Configuração</th><th>Valor</th></tr></thead><tbody>${rows}</tbody></table><div class="mxlab-actions"><button type="button" class="mxlab-btn" id="mxFixCopy">📋 Copiar Sensi</button></div>`;
          result.classList.add('show');
          const copy=q('#mxFixCopy');
          if(copy)copy.onclick=async()=>{const txt=`MestreXit Sensi\nDPI: ${r.dpi}\nGeral: ${r.geral}\nMira: ${r.mira}\nRed Dot: ${r.reddot}\n2x: ${r.x2}\n4x: ${r.x4}\nSniper: ${r.sniper}`;try{await navigator.clipboard.writeText(txt);copy.textContent='✅ Copiado!'}catch(_){window.prompt('Copie sua configuração:',txt)}};
        }
        if(img){
          const c=document.createElement('canvas');c.width=900;c.height=720;const x=c.getContext('2d');
          x.fillStyle='#0b0f16';x.fillRect(0,0,900,720);x.fillStyle='#ff8c00';x.font='900 42px Arial';x.fillText('MestreXit Sensi',50,70);x.fillStyle='#fff';x.font='24px Arial';x.fillText(`${r.device} • ${r.fingers} dedos • DPI ${r.dpi}`,50,115);
          [['Geral',r.geral],['Mira',r.mira],['Red Dot',r.reddot],['2x',r.x2],['4x',r.x4],['Sniper',r.sniper]].forEach((a,i)=>{x.fillStyle='rgba(255,255,255,.08)';x.fillRect(50,150+i*75,800,55);x.fillStyle='#fff';x.font='bold 24px Arial';x.fillText(a[0],75,186+i*75);x.fillStyle='#ff8c00';x.fillText(a[1]+'%',740,186+i*75)});
          x.fillStyle='rgba(255,255,255,.5)';x.font='18px Arial';x.fillText('Gerado pelo MestreXit Sensi Lab • Free Fire 2026',50,665);
          const a=document.createElement('a');a.download='MestreXit-Sensi.png';a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();
        }
      }
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindLab);else bindLab();
  setTimeout(bindLab,500);setTimeout(bindLab,1500);
})();
