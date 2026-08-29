(function(){
  const page=()=>document.getElementById('mxLabPage');
  function addNavOrganization(){
    const nav=document.querySelector('header nav'); if(!nav||nav.dataset.mxOrganized)return;
    nav.dataset.mxOrganized='1';
    if(nav.classList.contains('mx-tabs')) return;
    const info=document.getElementById('infoBtn'), lab=document.getElementById('mxLabBtn');
    if(!lab)return;
    const make=(txt)=>{const s=document.createElement('span');s.className='mx-nav-label';s.textContent=txt;return s};
    const sep=()=>{const s=document.createElement('span');s.className='mx-nav-sep';return s};
    const ids=['homeBtn','proBtn','twoThreeBtn','randomBtn','weaponBtn','dpiBtn','mxLabBtn','infoBtn'];
    ids.forEach(id=>document.getElementById(id)?.classList.remove('mx-old-order'));
    const home=document.getElementById('homeBtn'), pro=document.getElementById('proBtn'), two=document.getElementById('twoThreeBtn'), rand=document.getElementById('randomBtn'), weapon=document.getElementById('weaponBtn'), dpi=document.getElementById('dpiBtn');
    if(home) nav.insertBefore(make('PRINCIPAL'),home);
    if(pro) nav.insertBefore(make('SENSI'),pro);
    if(weapon) nav.insertBefore(make('CONFIGURAÇÕES'),weapon);
    if(lab) nav.insertBefore(make('LAB'),lab);
    if(info){nav.appendChild(sep());nav.appendChild(info);}
  }
  function enhance(){
    const p=page(); if(!p||p.dataset.mxExtra)return; p.dataset.mxExtra='1';
    const settings=p.querySelector('.settings-container'); if(!settings)return;
    const box=document.createElement('div'); box.className='mxextra'; box.innerHTML=`
      <div class="mxextra-card"><h3>🧠 Corrigir Minha Sensi</h3><p>Digite sua configuração atual e diga o problema. O MestreXit sugere ajustes.</p>
        <div class="mxextra-form"><label>Geral<input id="mxfG" type="number" min="1" max="200" value="180"></label><label>Red Dot<input id="mxfR" type="number" min="1" max="200" value="170"></label><label>2x<input id="mxf2" type="number" min="1" max="200" value="150"></label><label>4x<input id="mxf4" type="number" min="1" max="200" value="140"></label></div>
        <select id="mxfProblem" style="width:100%;margin-top:10px;padding:11px;border-radius:10px;background:#111722;color:#fff;border:1px solid rgba(255,255,255,.12)"><option value="passa">Mira passa da cabeça</option><option value="peito">Fica no peito</option><option value="lenta">Mira lenta</option><option value="rapida">Mira rápida</option><option value="recuo">Recuo alto</option><option value="capa">Difícil dar capa</option></select>
        <button class="mxextra-btn" id="mxFixBtn">🧠 Corrigir Sensi</button><div id="mxFixResult"></div>
      </div>
      <div class="mxextra-card"><h3>📊 Comparar Sensi</h3><p>Compare uma configuração antiga com a última sensi gerada.</p>
        <div class="mxextra-form"><label>Geral<input id="mxcG" type="number" value="180"></label><label>Red Dot<input id="mxcR" type="number" value="170"></label><label>2x<input id="mxc2" type="number" value="150"></label><label>4x<input id="mxc4" type="number" value="140"></label></div>
        <button class="mxextra-btn" id="mxCompareBtn">📊 Comparar</button><div id="mxCompareResult"></div>
      </div>
      <div class="mxextra-card"><h3>🎚️ Ajuste Fino</h3><p>Ajuste cada valor rapidamente com +1 ou -1.</p><div id="mxTune"></div><button class="mxextra-btn alt" id="mxTuneApply">Aplicar ao resultado</button></div>`;
    settings.appendChild(box);

    const val=(id)=>Number(document.getElementById(id)?.value||0);
    const clamp=v=>Math.max(1,Math.min(200,Math.round(v)));
    document.getElementById('mxFixBtn').onclick=()=>{
      const d={passa:-8,peito:8,lenta:10,rapida:-10,recuo:-6,capa:6}[document.getElementById('mxfProblem').value]||0;
      const g=clamp(val('mxfG')+d); const r=clamp(val('mxfR')+d); const x2=clamp(val('mxf2')+d); const x4=clamp(val('mxf4')+d);
      document.getElementById('mxFixResult').innerHTML=`<div class="mxfix-result"><b>Nova sugestão:</b><br>Geral: <b>${g}</b> • Red Dot: <b>${r}</b> • 2x: <b>${x2}</b> • 4x: <b>${x4}</b></div>`;
    };
    document.getElementById('mxCompareBtn').onclick=()=>{
      const r=window.__mestreXitLabLast||{geral:180,reddot:170,x2:150,x4:140}; const old={geral:val('mxcG'),reddot:val('mxcR'),x2:val('mxc2'),x4:val('mxc4')};
      const arr=[['Geral',old.geral,r.geral],['Red Dot',old.reddot,r.reddot],['2x',old.x2,r.x2],['4x',old.x4,r.x4]];
      document.getElementById('mxCompareResult').innerHTML='<div class="mxfix-result">'+arr.map(a=>`${a[0]}: <b>${a[1]}</b> → <b>${a[2]}</b> (${a[2]-a[1]>=0?'+':''}${a[2]-a[1]})`).join('<br>')+'</div>';
    };
    const tune=document.getElementById('mxTune');
    const tuneKeys=[
      ['Geral','geral',180],['Mira','mira',168],['Red Dot','reddot',158],
      ['2x','x2',146],['4x','x4',134],['Sniper','sniper',116]
    ];
    function drawTune(){
      const current=window.__mestreXitLabLast||{};
      tune.innerHTML=tuneKeys.map(a=>{
        const value=Number.isFinite(Number(current[a[1]]))?clamp(current[a[1]]):a[2];
        return `<div class="mx-tune-row"><b>${a[0]}</b><input type="range" min="1" max="200" value="${value}" data-key="${a[1]}" aria-label="${a[0]}"><button type="button" data-delta="-1">−</button><button type="button" data-delta="1">+</button></div>`;
      }).join('');
    }
    drawTune();
    tune.addEventListener('input',e=>{if(e.target.matches('input[type="range"]'))e.target.title=e.target.value+'%';});
    tune.addEventListener('click',e=>{
      const b=e.target.closest('button[data-delta]'); if(!b)return;
      e.preventDefault(); const input=b.parentElement.querySelector('input[type="range"]'); if(!input)return;
      input.value=clamp(Number(input.value)+Number(b.dataset.delta)); input.dispatchEvent(new Event('input',{bubbles:true}));
    });
    document.getElementById('mxTuneApply').onclick=()=>{
      const rows=[...tune.querySelectorAll('input[data-key]')];
      const r={...(window.__mestreXitLabLast||{})};
      rows.forEach(i=>r[i.dataset.key]=clamp(Number(i.value)));
      r.mira=Number.isFinite(r.mira)?r.mira:clamp(r.geral-12); r.dpi=Number.isFinite(r.dpi)?r.dpi:600;
      r.device=r.device||'Android básico'; r.fingers=r.fingers||3; r.mode=r.mode||'balanced';
      window.__mestreXitLabLast=r;
      const res=p.querySelector('#mxResult');
      if(res){
        const values={geral:r.geral,mira:r.mira,reddot:r.reddot,x2:r.x2,x4:r.x4,sniper:r.sniper};
        const labels={geral:'Geral',mira:'Mira',reddot:'Red Dot',x2:'Mira 2x',x4:'Mira 4x',sniper:'Mira Sniper'};
        res.querySelectorAll('.mxlab-table tbody tr').forEach(row=>{
          const name=row.cells?.[0]?.textContent?.trim(); const key=Object.keys(labels).find(k=>labels[k]===name);
          if(key&&row.cells[1])row.cells[1].innerHTML=`<b>${values[key]}%</b>`;
        });
        res.classList.add('show');
      }
      const cr=document.getElementById('mxCompareResult');
      if(cr)cr.innerHTML='<div class="mxfix-result">🎚️ <b>Ajuste fino aplicado!</b><br>Os valores foram atualizados no resultado acima.</div>';
    };
  }
  function run(){addNavOrganization();enhance();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setTimeout(run,700);setTimeout(run,1800);
})();
