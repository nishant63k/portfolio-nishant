import { readFile, writeFile, mkdir, copyFile, cp } from 'node:fs/promises';
const data = JSON.parse(await readFile(new URL('./content.json', import.meta.url), 'utf8'));
if (!data.name || !data.email || !Array.isArray(data.projects)) throw new Error('Content needs a name, email, and projects array.');
const ids = new Set();
for (const p of data.projects) {
  if (!p.id || ids.has(p.id) || !p.title || !p.video) throw new Error('Each project needs a unique id, title, and video URL.');
  ids.add(p.id);
  if (!['https:', 'http:'].includes(new URL(p.video).protocol)) throw new Error('Video URLs must use HTTPS or HTTP.');
}
const template = await readFile(new URL('./src/index.html', import.meta.url), 'utf8');
const safeJSON = JSON.stringify(data).replace(/</g, '\\u003c');
const escapedName = data.name.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await mkdir(new URL('./public/', import.meta.url), {recursive:true});
await writeFile(new URL('./public/index.html', import.meta.url), template.replaceAll('%%NAME%%', escapedName).replace('%%CONTENT%%', safeJSON));
for (const file of ['style.css', 'app.js']) await copyFile(new URL('./src/'+file, import.meta.url), new URL('./public/'+file, import.meta.url));
await cp(new URL('./src/assets/', import.meta.url), new URL('./public/assets/', import.meta.url), {recursive:true});
await copyFile(new URL('./content.json', import.meta.url), new URL('./public/content.json', import.meta.url));
console.log(`Built portfolio for ${data.name}: ${data.projects.length} projects.`);
