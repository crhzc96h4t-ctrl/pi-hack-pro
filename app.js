const $ = (id) => document.getElementById(id);
const store = {
  get: () => ({url: localStorage.getItem('haUrl') || '', token: localStorage.getItem('haToken') || '', entity: localStorage.getItem('entityId') || ''}),
  save: (url, token, entity) => { localStorage.setItem('haUrl',url); localStorage.setItem('haToken',token); localStorage.setItem('entityId',entity); },
  clear: () => ['haUrl','haToken','entityId'].forEach(k=>localStorage.removeItem(k))
};
function navigate(tab){
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${tab}`));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
function config(){return store.get()}
function setMessage(id,msg){$(id).textContent=msg}
function haHeaders(){const c=config();return {'Authorization':`Bearer ${c.token}`,'Content-Type':'application/json'}}
function validHA(){const c=config();if(!c.url||!c.token){setMessage('tvMessage','Stel eerst je Home Assistant HTTPS-adres en token in bij Instellingen.');return null}if(!/^https:\/\//i.test(c.url)){setMessage('tvMessage','Gebruik een HTTPS-adres voor Home Assistant.');return null}return c}
async function callHA(service,data={}){
  const c=validHA();if(!c)return;
  const entity=$('entityId').value.trim()||c.entity;
  if(!entity){setMessage('tvMessage','Vul eerst een entity ID in, bijvoorbeeld media_player.woonkamer_tv.');return}
  try{
    const r=await fetch(`${c.url.replace(/\/+$/,'')}/api/services/media_player/${service}`,{method:'POST',headers:haHeaders(),body:JSON.stringify({...data,entity_id:entity})});
    if(!r.ok)throw new Error(`HTTP ${r.status}: ${await r.text()}`);
    setMessage('tvMessage',`Opdracht '${service}' verzonden naar ${entity}.`);
  }catch(e){setMessage('tvMessage',`Verbinding mislukt: ${e.message}. Controleer HTTPS, token, CORS en Home Assistant-toegang.`)}
}
$('powerOn').addEventListener('click',()=>callHA('turn_on'));
$('powerOff').addEventListener('click',()=>callHA('turn_off'));
document.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>callHA(b.dataset.service)));
$('refreshTv').addEventListener('click',async()=>{
  const c=validHA();if(!c)return;
  try{const r=await fetch(`${c.url.replace(/\/+$/,'')}/api/`,{headers:haHeaders()});if(!r.ok)throw new Error(`HTTP ${r.status}`);const d=await r.json();setMessage('tvMessage',`Home Assistant bereikbaar: ${d.message||'API OK'}`);$('haBadge').textContent='CONNECTED';$('tvStatus').textContent='BRIDGE READY'}
  catch(e){setMessage('tvMessage',`Test mislukt: ${e.message}`);$('haBadge').textContent='OFFLINE'}
});
$('saveSettings').addEventListener('click',()=>{
  const url=$('haUrl').value.trim().replace(/\/+$/,''),token=$('haToken').value.trim(),entity=$('entityId').value.trim();
  if(url&&!/^https:\/\//i.test(url)){setMessage('settingsMessage','Gebruik een HTTPS-adres.');return}
  store.save(url,token,entity);setMessage('settingsMessage','Instellingen lokaal opgeslagen op dit apparaat.');
});
$('forgetSettings').addEventListener('click',()=>{store.clear();$('haUrl').value='';$('haToken').value='';$('entityId').value='';setMessage('settingsMessage','Opgeslagen instellingen verwijderd.')});
const saved=config();$('haUrl').value=saved.url;$('haToken').value=saved.token;$('entityId').value=saved.entity;
$('pwLength').addEventListener('input',e=>$('lengthOut').value=e.target.value);
$('pwGenerate').addEventListener('click',()=>{
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'+($('pwSymbols').checked?'!@#$%^&*()-_=+[]{}?':'');
  const bytes=new Uint32Array(Number($('pwLength').value));crypto.getRandomValues(bytes);
  $('pwResult').textContent=Array.from(bytes,b=>chars[b%chars.length]).join('');
});
$('pwCopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('pwResult').textContent);$('pwCopy').textContent='GEKOPIEERD';setTimeout(()=>$('pwCopy').textContent='KOPIEER',1300)}catch{$('pwCopy').textContent='KOPIEER HANDMATIG'}});
$('dnsRun').addEventListener('click',async()=>{
  const name=$('dnsName').value.trim(),type=$('dnsType').value;
  if(!name){setMessage('dnsResult','Vul een domeinnaam in.');return}
  setMessage('dnsResult','DNS-query uitvoeren…');
  try{
    const r=await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,{headers:{accept:'application/dns-json'}});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const d=await r.json();const lines=(d.Answer||[]).map(x=>`${x.name}  TTL ${x.TTL}  ${x.data}`);
    setMessage('dnsResult',lines.length?lines.join('\n'):'Geen records gevonden (of domein/record bestaat niet).');
  }catch(e){setMessage('dnsResult',`DNS-query mislukt: ${e.message}`)}
});
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
