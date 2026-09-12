const SUPABASE_URL='https://yxhxrlmydbiblpninatx.supabase.co';
const SUPABASE_KEY='sb_publishable_bp2Xrh7oGCwC55rj2JTGxQ_LmlAiabw';

const form=document.querySelector('#feedback-form');
const email=document.querySelector('#email');
const nameInput=document.querySelector('#name');
const material=document.querySelector('#material');
const message=document.querySelector('#message');
const emailError=document.querySelector('#email-error');
const ratingError=document.querySelector('#rating-error');
const status=document.querySelector('#form-status');
const counter=document.querySelector('#message-count');
const sourceFilter=document.querySelector('#source-filter');
const sourceItems=[...document.querySelectorAll('#source-list li')];
const noSources=document.querySelector('#no-sources');
const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#site-nav');

const disposable=new Set(['10minutemail.com','guerrillamail.com','mailinator.com','tempmail.com','temp-mail.org','yopmail.com','sharklasers.com','throwawaymail.com']);

function normalizeText(v=''){return v.trim().replace(/\s+/g,' ')}
function checkEmail(v){
  const n=v.trim().toLowerCase();
  if(!/^[^\s@]+@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(n)) return{ok:false,message:'Wpisz poprawny adres e-mail.'};
  const domain=n.split('@')[1];
  if(disposable.has(domain)) return{ok:false,message:'Adresy tymczasowe nie są akceptowane.'};
  return{ok:true,email:n,domain};
}

async function hasMx(domain){
  const r=await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,{headers:{accept:'application/dns-json'}});
  if(!r.ok) throw new Error('dns');
  const j=await r.json();
  return j.Status===0&&Array.isArray(j.Answer)&&j.Answer.length>0;
}

async function sendMessage(payload){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`,{
    method:'POST',
    headers:{
      'apikey':SUPABASE_KEY,
      'Authorization':`Bearer ${SUPABASE_KEY}`,
      'Content-Type':'application/json',
      'Prefer':'return=minimal'
    },
    body:JSON.stringify(payload)
  });
  if(!r.ok){
    const text=await r.text().catch(()=> '');
    throw new Error(`submit:${r.status}:${text.slice(0,160)}`);
  }
}

menuButton?.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded',String(open));
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
}));

message?.addEventListener('input',()=>{counter.textContent=String(message.value.length)});

sourceFilter?.addEventListener('input',()=>{
  const q=sourceFilter.value.trim().toLowerCase();
  let visible=0;
  sourceItems.forEach(li=>{
    const haystack=(li.dataset.search+' '+li.textContent).toLowerCase();
    const match=!q||haystack.includes(q);
    li.hidden=!match;
    if(match) visible++;
  });
  noSources.hidden=visible!==0;
});

form.addEventListener('submit',async e=>{
  e.preventDefault();
  emailError.textContent='';
  ratingError.textContent='';
  status.textContent='';
  status.className='status';

  const c=checkEmail(email.value);
  const rating=form.querySelector('input[name="rating"]:checked');
  let ok=true;
  if(!c.ok){emailError.textContent=c.message;ok=false}
  if(!rating){ratingError.textContent='Wybierz ocenę od 1 do 5.';ok=false}
  if(!ok) return;

  const button=form.querySelector('button[type="submit"]');
  const label=button.querySelector('span:first-child');
  button.disabled=true;
  label.textContent='Sprawdzam domenę…';

  try{
    const mx=await hasMx(c.domain);
    if(!mx){emailError.textContent='Ta domena nie ma aktywnego serwera pocztowego.';return}

    label.textContent='Wysyłam…';
    const displayName=normalizeText(nameInput.value)||'Mieszkaniec / gość strony';
    const userMessage=normalizeText(message.value);
    const subject=`Nowa Gadka · ocena ${rating.value}/5${material.checked?' · mam materiał':''}`;
    const body=[
      `Źródło: /nowa-gadka-test/`,
      `Ocena: ${rating.value}/5`,
      `Materiał / wspomnienie: ${material.checked?'tak':'nie'}`,
      userMessage?`Wiadomość: ${userMessage}`:'Wiadomość: brak'
    ].join('\n');

    await sendMessage({name:displayName,email:c.email,subject,message:body,status:'new'});
    status.textContent='Dziękuję — wiadomość została zapisana i trafiła do archiwum projektu.';
    status.classList.add('ok-state');
    form.reset();
    counter.textContent='0';
  }catch(err){
    console.error(err);
    status.textContent='Nie udało się teraz wysłać formularza. Spróbuj ponownie później.';
    status.classList.add('error-state');
  }finally{
    button.disabled=false;
    label.textContent='Wyślij do archiwum';
  }
});