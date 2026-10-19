const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const STORAGE = 'nishant-portfolio-v1';
const EDITOR_MODE = new URLSearchParams(window.location.search).get('edit') === '1';
let original, content, filter = 'All', activeId, currentList = [], lastFocus;
const text = (tag, value, className) => { const el = document.createElement(tag); el.textContent = value; if (className) el.className = className; return el; };
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('#toast').classList.remove('show'), 3500); }
function safeAsset(value) { if (typeof value !== 'string') return false; if (/^assets\/[a-zA-Z0-9._/-]+$/.test(value) && !value.includes('..')) return true; try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } }
function phoneDialValue(value) {
  if (typeof value !== 'string' || value.length > 40 || !/^[+\d\s().-]*$/.test(value)) return '';
  const dial = value.replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{6,14}$/.test(dial) ? dial : '';
}
function phoneContact(phone, email) {
  const dial = phoneDialValue(phone);
  return dial
    ? { href: `tel:${dial}`, label: `${phone.trim()} ↗`, canCopy: true }
    : { href: `mailto:${email}?subject=Let%E2%80%99s%20arrange%20a%20call`, label: 'Arrange a call by email ↗', canCopy: false };
}
function withoutPosters(data) {
  const clean = structuredClone(data);
  clean.projects.forEach(project => { delete project.poster; });
  return clean;
}
function videoSource(value) {
  if (!safeAsset(value)) return null;
  if (value.startsWith('assets/')) return {kind:'video',url:value};
  const u = new URL(value); let id;
  if (['www.youtube.com','youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(u.hostname)) {
    id = u.hostname === 'youtu.be' ? u.pathname.split('/')[1] : u.searchParams.get('v') || u.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1];
    return /^[\w-]{11}$/.test(id || '') ? {kind:'embed',url:`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} : null;
  }
  if (['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(u.hostname)) { id=u.pathname.match(/(?:\/video)?\/(\d+)(?:\/([a-zA-Z0-9]+))?\/?$/); return id ? {kind:'embed',url:`https://player.vimeo.com/video/${id[1]}?autoplay=1${id[2] ? `&h=${id[2]}` : ''}`} : null; }
  return /\.(mp4|webm)$/i.test(u.pathname) ? {kind:'video',url:value} : null;
}
function validContent(data) {
  const cats = ['Cinematic','Social edits','Gaming','Motion'];
  if (data?.phone !== undefined && (typeof data.phone !== 'string' || (data.phone !== '' && !phoneDialValue(data.phone)))) return false;
  return data && typeof data.name === 'string' && data.name.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && typeof data.intro === 'string' && typeof data.headline === 'string' && Array.isArray(data.software) && data.software.length <= 20 && data.software.every(x => typeof x === 'string' && x.length < 100) && Array.isArray(data.projects) && data.projects.length > 0 && data.projects.length <= 30 && new Set(data.projects.map(p => p.id)).size === data.projects.length && data.projects.every(p => ['id','title','category','type','summary','video','duration','format','brief','approach','deliverables','tools'].every(k => typeof p[k] === 'string' && p[k].length < 5000) && /^[a-zA-Z0-9_-]+$/.test(p.id) && cats.includes(p.category) && videoSource(p.video) && typeof p.concept === 'boolean');
}
function renderProfile() {
  $('.brand-name').firstChild.textContent = content.name.toUpperCase();
  $('footer>span').replaceChildren(document.createTextNode(`© ${new Date().getFullYear()} ${content.name}`));
  document.title = `${content.name} — Video Editor & Motion Designer`;
  $('#hero-intro').textContent = content.intro;
  const parts = content.headline.split('\n'); $('#hero-title').replaceChildren(document.createTextNode(parts[0]), document.createElement('br'), text('span',parts.slice(1).join(' ')));
  $('#email-link').textContent = `${content.email} ↗`; $('#email-link').href = `mailto:${content.email}`;
  const phone = phoneContact(content.phone, content.email);
  $('#phone-link').textContent = phone.label; $('#phone-link').href = phone.href;
  $('#copy-phone').hidden = !phone.canCopy;
  const initials = {'Premiere Pro':'Pr','After Effects':'Ae','CapCut':'Cc','Canva':'Ca'};
  $('#software-list').replaceChildren(...content.software.map(tool => { const el=text('span','', 'software-chip'); el.append(text('b',initials[tool] || tool.slice(0,2)),document.createTextNode(tool)); return el; }));
  $('.collection-note').textContent = content.projects.every(p=>p.concept) ? 'Playable design studies, created for this portfolio. Original client footage coming soon.' : content.projects.some(p=>p.concept) ? 'Explore the collection. Concept previews are labeled separately from original projects.' : 'A collection of edits, stories, and creative collaborations.';
  $('.concept-note').lastChild.textContent = content.projects.every(p=>p.concept) ? ' CONCEPT COLLECTION' : ' PROJECT COLLECTION';
  $('[data-filter="All"] span').textContent = String(content.projects.length).padStart(2,'0');
}
function renderProjects() {
  $$('#projects video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
  const visible=content.projects.filter(p => filter === 'All' || p.category === filter);
  $('#projects').replaceChildren(...visible.map(p => {
    const card=text('article','','project-card'); const button=text('button','','project-open'); button.setAttribute('aria-label',`Play ${p.title}${p.concept ? ', concept preview' : ''}`);
    const preview=text('div','','project-preview');
    const fallback=text('div','','preview-fallback'); fallback.append(text('span',p.category.toUpperCase(),'preview-category'),text('span','PLAY VIDEO ↗','preview-prompt')); preview.append(fallback);
    const source=videoSource(p.video);
    if(source?.kind==='video'){
      const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='metadata';video.tabIndex=-1;video.setAttribute('aria-hidden','true');
      video.addEventListener('loadedmetadata',()=>{if(!video.isConnected)return;try{if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Math.min(.75,video.duration/2);}catch{}},{once:true});
      video.addEventListener('loadeddata',()=>preview.classList.add('frame-ready'),{once:true});
      video.addEventListener('error',()=>{preview.classList.remove('frame-ready');video.remove();},{once:true});
      video.src=source.url;preview.append(video);
    }else if(source?.kind==='embed'){
      $('.preview-prompt',fallback).textContent=source.url.includes('youtube-nocookie.com')?'PLAY YOUTUBE VIDEO ↗':'PLAY VIMEO VIDEO ↗';
    }
    const play=text('span','▶','card-play'); play.setAttribute('aria-hidden','true');
    const meta=text('div','','preview-meta'); meta.append(text('span',p.concept?'CONCEPT PREVIEW':'PROJECT FILM'),text('span',`${p.duration} / ${p.format}`)); preview.append(play,meta);
    const title=text('h3',p.title,'project-title'); title.append(text('span','↗')); button.append(preview,title,text('p',p.type,'project-type')); button.addEventListener('click',()=>openProject(p.id,visible.map(x=>x.id))); card.append(button); return card;
  }));
  $('#filter-status').textContent=`${visible.length} ${filter === 'All' ? '' : filter} projects shown.`;
}
function openDialog(dialog) { lastFocus=document.activeElement; dialog.showModal(); }
function clearPlayer() { const v=$('video',$('#video-stage')); if(v){v.pause();v.removeAttribute('src');v.load();} $('#video-stage').replaceChildren(); }
function showMediaError() { const stage=$('#video-stage'); if($('.media-error',stage)) return; const box=text('div','','media-error'); box.append(text('h3','This video can’t play here.'),text('p','The link may be private, unavailable, or in an unsupported format. Replace the media in Edit portfolio with a direct MP4/WebM or an embeddable YouTube/Vimeo link.')); stage.append(box); }
function selectTab(which, focus=false) { const tabs=$$('.tabs [role=tab]'); tabs.forEach((t,i)=>{const selected=(i===which);t.setAttribute('aria-selected',selected);t.tabIndex=selected?0:-1;$(`#${t.getAttribute('aria-controls')}`).hidden=!selected;});if(focus)tabs[which].focus(); }
function openProject(id, list) {
  activeId=id; if(list)currentList=list; const p=content.projects.find(p=>p.id===id); if(!p)return;
  clearPlayer(); $('#modal-title').textContent=p.title; $('#modal-type').textContent=p.type.toUpperCase(); $('#modal-label').textContent=p.concept?'CONCEPT PREVIEW · ILLUSTRATIVE WORK':'PROJECT FILM';
  $('#modal-summary').textContent=p.summary;$('#modal-brief').textContent=p.brief;$('#modal-approach').textContent=p.approach;
  $('#case-disclaimer').textContent=p.concept?'Illustrative creative brief. This preview demonstrates a visual direction and does not represent a completed client project.':'';
  $('#modal-meta').replaceChildren(...[['DELIVERABLES',p.deliverables],['TOOLKIT',p.tools],['FORMAT',p.format]].map(([label,value])=>{const el=text('div','');el.append(text('span',label),document.createTextNode(value));return el;}));
  $('#project-position').textContent=`${currentList.indexOf(id)+1} / ${currentList.length}`;$('#prev-project').disabled=currentList.length<2;$('#next-project').disabled=currentList.length<2;selectTab(0);
  const src=videoSource(p.video);
  if(src?.kind==='video'){const v=document.createElement('video');v.src=src.url;v.controls=true;v.playsInline=true;v.preload='metadata';v.volume=.4;v.setAttribute('aria-label',p.title);v.addEventListener('error',showMediaError,{once:true});$('#video-stage').append(v);v.play().catch(()=>{});}
  else if(src?.kind==='embed'){const frame=document.createElement('iframe');frame.src=src.url;frame.title=p.title;frame.allow='autoplay; fullscreen; picture-in-picture';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;$('#video-stage').append(frame);}
  else showMediaError();
  if(!$('#project-dialog').open)openDialog($('#project-dialog'));
}
function nextProject(offset){const index=currentList.indexOf(activeId);openProject(currentList[(index+offset+currentList.length)%currentList.length]);}
async function copy(value){try{await navigator.clipboard.writeText(value);return true;}catch{const area=document.createElement('textarea');area.value=value;area.style.cssText='position:fixed;opacity:0;left:0;top:0';(document.querySelector('dialog[open]')||document.body).append(area);area.select();const result=document.execCommand('copy');area.remove();return result;}}
function fillProjectEditor(){const p=content.projects.find(p=>p.id===$('#edit-project').value);for(const k of ['title','category','summary','video','duration','format','brief','approach','deliverables','tools'])$(`#edit-${k}`).value=p[k];$('#edit-concept').checked=p.concept;}
function fillEditor(){ $('#edit-project').replaceChildren(...content.projects.map(p=>{const option=text('option',p.title);option.value=p.id;return option;}));fillProjectEditor();$('#edit-name').value=content.name;$('#edit-email').value=content.email;$('#edit-phone').value=content.phone || '';$('#edit-intro').value=content.intro;$('#edit-software').value=content.software.join(', '); }
function saveContent(data) { if(!validContent(data))throw new Error('Please check the project links and content format.');data=withoutPosters(data);localStorage.setItem(STORAGE,JSON.stringify(data));content=data;renderProfile();renderProjects(); }
function exportContent(){const blob=new Blob([JSON.stringify(content,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='content.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#editor-status').textContent='Exported saved content. To update every visitor’s view, replace public/content.json in the source and redeploy.';}
function briefText(){const f=new FormData($('#brief-form'));return `Hi ${content.name.split(' ')[0]},\n\nI’d like to discuss a video editing project.\n\nName: ${f.get('name')}\nEmail: ${f.get('email')}\nProject: ${f.get('type')}\nTimeline: ${f.get('timeline') || 'Flexible'}\n\nThe idea:\n${f.get('idea')}\n\nThanks,\n${f.get('name')}`;}
async function init(){
  try{original=JSON.parse(document.getElementById('portfolio-content').textContent);if(!validContent(original))throw new Error('Invalid content');original=withoutPosters(original);content=structuredClone(original);if(EDITOR_MODE){try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(validContent(saved))content=withoutPosters(saved);}catch{}}$('#open-editor').hidden=!EDITOR_MODE;renderProfile();renderProjects();}
  catch(error){$('#projects').append(text('p','The project collection could not load. Please refresh the page.'));console.error(error);return;}
  $$('.filters button').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;$$('.filters button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderProjects();}));
  $('#play-hero').addEventListener('click',()=>openProject(content.projects[0].id,content.projects.map(p=>p.id)));
  $('#compare-range').addEventListener('input',e=>$('#comparison').style.setProperty('--split',`${e.target.value}%`));
  $$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  $$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{if(d.id==='project-dialog')clearPlayer();lastFocus?.focus();});});
  $('#prev-project').addEventListener('click',()=>nextProject(-1));$('#next-project').addEventListener('click',()=>nextProject(1));
  $('#project-dialog').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)&&!['VIDEO','INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)&&!e.target.closest('.tabs')){e.preventDefault();nextProject(e.key==='ArrowLeft'?-1:1);}});
  $$('.tabs button').forEach((t,i)=>{t.addEventListener('click',()=>selectTab(i));t.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selectTab(e.key==='Home'?0:e.key==='End'?1:1-i,true);}});});
  $('#project-contact').addEventListener('click',()=>$('#project-dialog').close());
  $('#copy-email').addEventListener('click',async()=>toast(await copy(content.email)?'Email address copied.':`Email: ${content.email}`));
  $('#copy-phone').addEventListener('click',async()=>{if(phoneDialValue(content.phone))toast(await copy(content.phone)?'Phone number copied.':`Phone: ${content.phone}`);});
  $('#open-brief').addEventListener('click',()=>openDialog($('#brief-dialog')));
  $('#brief-form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const url=`mailto:${content.email}?subject=${encodeURIComponent(`Video editing project — ${f.get('type')}`)}&body=${encodeURIComponent(briefText())}`;window.location.href=url;$('#brief-status').textContent='Your brief is ready in your email app. Nothing has been sent yet. If it didn’t open, use Copy brief and email me directly.';});
  $('#copy-brief').addEventListener('click',async()=>{if(!$('#brief-form').reportValidity())return;$('#brief-status').textContent=await copy(briefText())?`Brief copied. Paste it into an email to ${content.email}.`:'Could not copy. Please select your text and copy it manually.';});
  $('#open-editor').addEventListener('click',()=>{fillEditor();$('#editor-status').textContent='';openDialog($('#editor-dialog'));});
  $('#edit-project').addEventListener('change',fillProjectEditor);
  $('#editor-form').addEventListener('submit',e=>{e.preventDefault();try{if(!videoSource($('#edit-video').value.trim()))throw new Error('Add a direct MP4/WebM or valid YouTube/Vimeo video link.');const next=structuredClone(content);const p=next.projects.find(p=>p.id===$('#edit-project').value);for(const k of ['title','category','summary','video','duration','format','brief','approach','deliverables','tools'])p[k]=$(`#edit-${k}`).value.trim();p.type=({Cinematic:'Cinematic storytelling','Social edits':'Short-form / creator content',Gaming:'Gaming / creator content',Motion:'Motion graphics / title design'})[p.category];p.concept=$('#edit-concept').checked;next.name=$('#edit-name').value.trim();next.email=$('#edit-email').value.trim();next.phone=$('#edit-phone').value.trim();if(next.phone && !phoneDialValue(next.phone))throw new Error('Enter your phone number with + and its country code, such as +91 for India.');next.intro=$('#edit-intro').value.trim();next.software=$('#edit-software').value.split(',').map(x=>x.trim()).filter(Boolean);saveContent(next);$('#edit-project').selectedOptions[0].textContent=p.title;$('#editor-status').textContent='Saved in this browser. Export your content to keep a copy; the hosted source remains unchanged until redeployed.';}catch(err){$('#editor-status').textContent=err.message;}});
  $('#export-content').addEventListener('click',exportContent);
  $('#import-content').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>200000)throw new Error('Choose a content JSON file smaller than 200 KB.');const data=JSON.parse(await file.text());saveContent(data);fillEditor();$('#editor-status').textContent='Content imported and saved in this browser.';}catch(err){$('#editor-status').textContent=`Could not import: ${err.message}`;}e.target.value='';});
  let resetArmed=false;$('#reset-content').addEventListener('click',()=>{if(!resetArmed){resetArmed=true;$('#reset-content').textContent='Click again to restore published content';setTimeout(()=>{resetArmed=false;$('#reset-content').textContent='Restore published content';},5000);return;}try{saveContent(structuredClone(original));fillEditor();$('#editor-status').textContent='Published content restored in this browser.';}catch{$('#editor-status').textContent='Browser storage is unavailable.';}resetArmed=false;$('#reset-content').textContent='Restore published content';});
}
init();

