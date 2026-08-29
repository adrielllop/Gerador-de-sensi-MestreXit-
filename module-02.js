(function(){
  const overlay=document.getElementById('mxGeneratorOverlay');
  const brand=document.getElementById('mxBrand');
  const close=document.getElementById('mxClosePanel');
  const exit=document.getElementById('mxSairGerador');
  let timerStart=Date.now();
  let timerId=null;

  function openPanel(){
    if(!overlay)return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    timerStart=Number(localStorage.getItem('mx_generator_start')||Date.now());
    localStorage.setItem('mx_generator_start',timerStart);
    updateInfo();
    if(!timerId) timerId=setInterval(updateInfo,1000);
  }
  function closePanel(){
    if(!overlay)return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
  }
  function updateInfo(){
    const ua=navigator.userAgent||'';
    const android=(ua.match(/Android\s([0-9.]+)/i)||[])[1]||'Não identificado';
    let marca='Não identificado', modelo='Não identificado';
    if(/Samsung/i.test(ua)) marca='Samsung';
    else if(/Motorola|moto/i.test(ua)) marca='Motorola';
    else if(/Xiaomi|Redmi|POCO/i.test(ua)) marca=/Redmi/i.test(ua)?'Redmi':(/POCO/i.test(ua)?'POCO':'Xiaomi');
    else if(/iPhone|iPad/i.test(ua)) marca='Apple';
    const modelMatch=ua.match(/;\s*([^;)]+?)\s+Build\//i);
    if(modelMatch) modelo=modelMatch[1].trim();
    const ram=(navigator.deviceMemory?navigator.deviceMemory+' GB':'Indisponível');
    const dpi=localStorage.getItem('mx_dpi_atual')||'Indisponível';
    let fps='60 FPS';
    if(navigator.hardwareConcurrency && navigator.hardwareConcurrency>=8) fps='60–120 FPS';
    document.getElementById('mxMarca').textContent=marca;
    document.getElementById('mxModelo').textContent=modelo;
    document.getElementById('mxRam').textContent=ram;
    document.getElementById('mxAndroid').textContent=android;
    document.getElementById('mxDpi').textContent=dpi;
    document.getElementById('mxFps').textContent=fps;
    const elapsed=Math.max(0,Date.now()-timerStart);
    const s=Math.floor(elapsed/1000), h=Math.floor(s/3600), mi=Math.floor((s%3600)/60), se=s%60;
    document.getElementById('mxTimer').textContent=[h,mi,se].map(v=>String(v).padStart(2,'0')).join(':');
    document.getElementById('mxAtivacao').textContent=new Date(timerStart).toLocaleDateString('pt-BR');
  }
  if(brand) brand.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openPanel();});
  if(close) close.addEventListener('click',closePanel);
  if(overlay) overlay.addEventListener('click',e=>{if(e.target===overlay)closePanel();});
  if(exit) exit.addEventListener('click',function(){
    closePanel();
    // Volta para a tela de Keys. Se o projeto tiver uma página/âncora específica,
    // o primeiro alvo abaixo será usado.
    const keys=document.getElementById('keysPage')||document.getElementById('keyPage')||document.querySelector('[data-page="keys"]');
    if(keys){
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      keys.classList.add('active');
      keys.scrollIntoView({behavior:'smooth',block:'start'});
    }else{
      const home=document.querySelector('.page#homePage');
      if(home){
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
        home.classList.add('active');
        window.scrollTo({top:0,behavior:'smooth'});
      }
    }
  });
})();
