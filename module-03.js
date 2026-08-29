(function(){
  const page=document.createElement('div'); page.className='page'; page.id='mxLabPage';
  page.innerHTML=`
    <a href="#" class="back-home" id="mxLabBack"><i class="fas fa-arrow-left"></i> Voltar para o Início</a>
    <div class="mxlab-head"><div><h2 class="mxlab-title"><i class="fas fa-wand-magic-sparkles"></i> Mestre<span>Xit</span> Sensi Lab</h2><p class="mxlab-sub">Novo gerador inteligente: aparelho + estilo + problema de mira.</p></div><span class="mxlab-pill">MESTREXIT 2026</span></div>
    <div class="mxlab-grid">
      <div class="mxlab-card"><div class="mxlab-icon">📱</div><h3>Gerador por aparelho</h3><p>Adapta a configuração ao tipo de celular e ao desempenho informado.</p></div>
      <div class="mxlab-card"><div class="mxlab-icon">🎯</div><h3>Modo de mira</h3><p>Escolha Full Capa, Rush, Precisão, Controle, One Tap ou Equilibrado.</p></div>
      <div class="mxlab-card"><div class="mxlab-icon">🧠</div><h3>Diagnóstico</h3><p>Informe o problema da sua mira e receba uma correção automática.</p></div>
      <div class="mxlab-card"><div class="mxlab-icon">📊</div><h3>Comparador</h3><p>Compare sua sensi atual com a configuração criada pelo MestreXit.</p></div>
    </div>
    <div class="settings-container">
      <h2 class="settings-title"><i class="fas fa-sliders"></i> Gerador MestreXit</h2>
      <div class="mxlab-form">
        <div class="mxlab-field"><label>📱 Aparelho</label><select id="mxDevice"><option>Android básico</option><option>Samsung</option><option>Motorola</option><option>Xiaomi / Redmi / POCO</option><option>iPhone</option><option>Android gamer</option></select></div>
        <div class="mxlab-field"><label>🎮 Dedos</label><select id="mxFingers"><option value="2">2 dedos</option><option value="3">3 dedos</option><option value="4">4 dedos</option><option value="5">5 dedos</option></select></div>
        <div class="mxlab-field"><label>🎯 Modo</label><select id="mxMode"><option value="capa">🔥 Full Capa</option><option value="rush">⚡ Rush</option><option value="precision">🎯 Precisão</option><option value="control">🛡️ Controle</option><option value="onetap">👆 One Tap</option><option value="balanced">⚖️ Equilibrado</option></select></div>
        <div class="mxlab-field"><label>📐 DPI</label><input id="mxLabDpi" type="number" min="300" max="1200" step="10" value="600"></div>
        <div class="mxlab-field"><label>⚡ Intensidade <span id="mxIntensityText">75%</span></label><div class="mxlab-range"><input id="mxIntensity" type="range" min="30" max="100" value="75"><b id="mxIntensityVal">75</b></div></div>
      </div>
      <h3 style="margin:25px 0 8px">🧠 O que está acontecendo com sua mira?</h3>
      <div class="mxdiag" id="mxProblems">
        <button data-problem="passa">🎯 A mira passa da cabeça</button><button data-problem="peito">🫥 Fica muito no peito</button><button data-problem="lenta">🐢 Mira muito lenta</button><button data-problem="rapida">💨 Mira muito rápida</button><button data-problem="recuo">🔫 Recuo muito alto</button><button data-problem="capa">🔥 Dificuldade para dar capa</button>
      </div>
      <div class="mxlab-actions"><button type="button" class="mxlab-btn" id="mxGenerate"><i class="fas fa-bolt"></i> Gerar Sensi MestreXit</button><button type="button" class="mxlab-btn alt" id="mxDaily"><i class="fas fa-calendar-day"></i> Sensi do Dia</button><button type="button" class="mxlab-btn alt" id="mxExport"><i class="fas fa-image"></i> Gerar Imagem</button></div>
      <div id="mxResult" class="mxlab-result"></div>
      <div class="mxlab-note">* As configurações são presets gerados pelo sistema e servem como ponto de partida. O desempenho pode variar conforme aparelho, HUD e estilo de jogo.</div>
    </div>`;
  document.body.insertBefore(page,document.body.querySelector('footer')||document.body.lastElementChild);

  // Add navigation entry without changing the existing menu structure.
  const nav=document.querySelector('header nav');
  if(nav){
    const infoBtn=document.getElementById('infoBtn');
    const a=document.createElement('a');
    a.href='#'; a.className='nav-btn'; a.id='mxLabBtn';
    a.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> MestreXit Lab';
    if(infoBtn) nav.insertBefore(a, infoBtn); else nav.appendChild(a);
    // Garante que Info seja sempre a última aba.
    if(infoBtn) nav.appendChild(infoBtn);
  }
  const homeGrid=document.querySelector('.features-grid');
  if(homeGrid){const c=document.createElement('div');c.className='feature-card';c.innerHTML='<i class="fas fa-wand-magic-sparkles card-icon"></i><h3 class="card-title">MestreXit Sensi Lab</h3><p class="card-description">Novo gerador por aparelho, estilo, diagnóstico e comparação.</p><button class="card-btn" id="mxHomeBtn">Abrir MestreXit Lab</button>';homeGrid.appendChild(c);}

  const intensity=document.getElementById('mxIntensity');
  intensity.addEventListener('input',()=>{document.getElementById('mxIntensityVal').textContent=intensity.value;document.getElementById('mxIntensityText').textContent=intensity.value+'%';});
  document.querySelectorAll('#mxProblems button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#mxProblems button').forEach(x=>x.classList.remove('active'));b.classList.add('active');}));

  let last=null;
  function clamp(v){return Math.max(1,Math.min(200,Math.round(v)));}
  function base(){
    const device=document.getElementById('mxDevice').value, fingers=+document.getElementById('mxFingers').value, mode=document.getElementById('mxMode').value, dpi=+document.getElementById('mxLabDpi').value||600, inten=+intensity.value;
    let factor=0;
    const modes={capa:12,rush:16,precision:-8,control:-13,onetap:9,balanced:0}; factor=modes[mode]||0;
    const dev=device.includes('iPhone')?5:device.includes('gamer')?8:device.includes('básico')?-7:0;
    const finger=(fingers-3)*2, dpiAdj=(dpi-600)/70, intAdj=(inten-70)*0.35;
    let g=175+factor+dev+finger+dpiAdj+intAdj;
    const problem=document.querySelector('#mxProblems button.active')?.dataset.problem||'';
    if(problem==='passa')g-=10;if(problem==='peito')g+=10;if(problem==='lenta')g+=12;if(problem==='rapida')g-=12;if(problem==='recuo')g-=6;if(problem==='capa')g+=7;
    return {geral:clamp(g),mira:clamp(g-12),reddot:clamp(g-22),x2:clamp(g-34),x4:clamp(g-46),sniper:clamp(g-64),dpi:Math.max(300,Math.min(1200,Math.round(dpi))),device,fingers,mode,problem};
  }
  function render(r,title='Sua nova configuração'){
    last=r; localStorage.setItem('mx_dpi_atual',r.dpi);
    const labels={geral:'Geral',mira:'Mira',reddot:'Red Dot',x2:'Mira 2x',x4:'Mira 4x',sniper:'Mira Sniper'};
    const rows=Object.entries(labels).map(([k,n])=>`<tr><td>${n}</td><td><b>${r[k]}%</b></td></tr>`).join('');
    const score=Math.round((r.geral+r.mira+r.reddot+r.x2+r.x4+r.sniper)/12);
    document.getElementById('mxResult').innerHTML=`<div class="mxlab-result-head"><div><h2 style="margin:0">${title}</h2><p style="margin:6px 0;color:rgba(255,255,255,.7)">${r.device} • ${r.fingers} dedos • DPI ${r.dpi}</p></div><div><span class="mxlab-pill">${r.mode.toUpperCase()}</span> <span class="mxlab-score">${score}</span></div></div><table class="mxlab-table"><thead><tr><th>Configuração</th><th>Valor</th></tr></thead><tbody>${rows}</tbody></table><div class="mxlab-actions"><button class="mxlab-btn" id="mxCopy"><i class="fas fa-copy"></i> Copiar Sensi</button><button class="mxlab-btn alt" id="mxCompare"><i class="fas fa-code-compare"></i> Comparar com minha Sensi</button></div><div id="mxCompareBox"></div>`;
    document.getElementById('mxResult').classList.add('show');
    document.getElementById('mxCopy').onclick=()=>{navigator.clipboard?.writeText(`MestreXit Sensi\nDPI: ${r.dpi}\nGeral: ${r.geral}\nMira: ${r.mira}\nRed Dot: ${r.reddot}\n2x: ${r.x2}\n4x: ${r.x4}\nSniper: ${r.sniper}`);document.getElementById('mxCopy').innerHTML='✅ Copiado!';};
    document.getElementById('mxCompare').onclick=()=>{
      document.getElementById('mxCompareBox').innerHTML=`<div class="mxlab-card" style="margin-top:14px"><h3>📊 Comparar sua sensi</h3><div class="mxlab-compare"><div>${['geral','mira','reddot','x2','x4','sniper'].map(k=>`<label style="display:block;margin:8px 0;text-transform:capitalize">${k}: <input class="mxold" data-k="${k}" type="number" min="0" max="200" value="${Math.max(1,r[k]-5)}"></label>`).join('')}</div><div id="mxDiff" style="padding:8px"></div></div><button class="mxlab-btn" id="mxDoCompare" style="margin-top:10px">Calcular diferença</button></div>`;
      document.getElementById('mxDoCompare').onclick=()=>{const diffs=[...document.querySelectorAll('.mxold')].map(i=>`${i.dataset.k}: ${Number(i.value)} → ${r[i.dataset.k]} (${r[i.dataset.k]-Number(i.value)>=0?'+':''}${r[i.dataset.k]-Number(i.value)})`);document.getElementById('mxDiff').innerHTML='<b>Resultado</b><br>'+diffs.join('<br>');};
    };
  }
  document.getElementById('mxGenerate').onclick=()=>render(base());
  document.getElementById('mxDaily').onclick=()=>{const day=new Date();const seed=day.getFullYear()*10000+(day.getMonth()+1)*100+day.getDate();const r=base();r.geral=clamp(160+(seed%41));r.mira=clamp(r.geral-10);r.reddot=clamp(r.geral-20);r.x2=clamp(r.geral-32);r.x4=clamp(r.geral-44);r.sniper=clamp(r.geral-62);render(r,'🔥 Sensi do Dia');};
  document.getElementById('mxExport').onclick=()=>{if(!last){render(base());}setTimeout(()=>{const r=last,c=document.createElement('canvas');c.width=900;c.height=720;const x=c.getContext('2d');x.fillStyle='#0b0f16';x.fillRect(0,0,c.width,c.height);x.fillStyle='#ff8c00';x.font='900 42px Arial';x.fillText('MestreXit Sensi',50,70);x.fillStyle='#fff';x.font='24px Arial';x.fillText(`${r.device} • ${r.fingers} dedos • DPI ${r.dpi}`,50,115);[['Geral',r.geral],['Mira',r.mira],['Red Dot',r.reddot],['2x',r.x2],['4x',r.x4],['Sniper',r.sniper]].forEach((a,i)=>{x.fillStyle='rgba(255,255,255,.08)';x.fillRect(50,150+i*75,800,55);x.fillStyle='#fff';x.font='bold 24px Arial';x.fillText(a[0],75,186+i*75);x.fillStyle='#ff8c00';x.fillText(a[1]+'%',740,186+i*75)});x.fillStyle='rgba(255,255,255,.5)';x.font='18px Arial';x.fillText('Gerado pelo MestreXit Sensi Lab • Free Fire 2026',50,665);const a=document.createElement('a');a.download='MestreXit-Sensi.png';a.href=c.toDataURL('image/png');a.click();},50);};

  function openLab(){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));page.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
  function home(){const h=document.getElementById('homePage');if(h){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));h.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}}
  document.getElementById('mxLabBtn')?.addEventListener('click',e=>{e.preventDefault();openLab();});
  document.getElementById('mxHomeBtn')?.addEventListener('click',e=>{e.preventDefault();openLab();});
  document.getElementById('mxLabBack')?.addEventListener('click',e=>{e.preventDefault();home();});

  // Marca MestreXit no título e metadados sem remover funcionalidades existentes.
  document.title='MestreXit Sensi | Gerador Inteligente Free Fire 2026';
})();
