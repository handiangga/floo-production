export const monthNames=['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
export const abbrev=['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGU','SEP','OKT','NOV','DES'];
export const nowMonth=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit'}).format(new Date());return p};
function dateParse(v,year){if(!v)return null;const s=String(v).trim();if(/^\d{4}-\d\d-\d\d/.test(s))return s.slice(0,10);const m=s.match(/^(\d{1,2})[\s\/-]+([A-Za-z]+|\d{1,2})(?:[\s\/-]+(\d{2,4}))?/);if(!m)return null;const mm=/^\d+$/.test(m[2])?Number(m[2]):monthNames.findIndex(x=>x.startsWith(m[2].toUpperCase().slice(0,3)))+1;const yy=m[3]?Number(m[3])+(m[3].length===2?2000:0):year;if(!mm||mm>12)return null;return `${yy}-${String(mm).padStart(2,'0')}-${String(Number(m[1])).padStart(2,'0')}`}
function color(c){
 const rgb=c?.effectiveFormat?.backgroundColorStyle?.rgbColor||c?.userEnteredFormat?.backgroundColorStyle?.rgbColor||c?.effectiveFormat?.backgroundColor||c?.userEnteredFormat?.backgroundColor;
 if(!rgb)return 'white';
 // Sheets omits RGB components whose value is zero.  Missing green/blue on
 // `{ red: 1 }` means pure red, not white.
 const r=Math.round((rgb.red??0)*255),g=Math.round((rgb.green??0)*255),b=Math.round((rgb.blue??0)*255);
 // Spreadsheet colours are manually applied and have several shades.  Compare the
 // dominant colour instead of accepting just one exact shade (for example #ff0000,
 // #cc0000 and soft red are all cancellations).
 if((r>230&&g>175&&g<245&&b<225&&r>g&&g>b)||(r>220&&g>=55&&g<180&&b<100&&r>g+25))return 'orange';
 // Brown is a regular-order colour in the WhatsApp sheet.  It has a red component
 // too, so cancellation must be limited to the actual red hue (not merely a
 // red-dominant dark colour such as brown).
 const maximum=Math.max(r,g,b),minimum=Math.min(r,g,b);
 const hue=maximum===minimum?0:maximum===r?60*((g-b)/(maximum-minimum)%6):maximum===g?60*((b-r)/(maximum-minimum)+2):60*((r-g)/(maximum-minimum)+4);
 const normalizedHue=(hue+360)%360;
 if(r>=100&&r>g*1.35&&r>b*1.35&&(normalizedHue<=15||normalizedHue>=345))return 'red';
 if(g>=100&&g>r*1.35&&g>b*1.35)return 'green';
 if(r>125&&b>105&&g>95&&r<225&&g<230)return 'purple';
 return 'white'
}
function plusDays(date,days){if(!date)return null;const value=new Date(`${date}T00:00:00Z`);value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10)}
const val=c=>String(c?.formattedValue??'').trim();
// Status is derived from background color: red = cancelled, green = empty package, orange = express, purple = shipped.
const shopee={rowNumber:0,number:1,date:2,user:3,model:4,color:5,size:6,qty:7,req:8,due:9,cutter:10,sewer:11,sewn:12,payet:13,payetSubmitted:14,useColorStatus:true};
// Format WhatsApp A-Q: alamat, nomor HP, ekspedisi, DP, dan pelunasan sengaja diabaikan.
const whatsapp={number:0,date:1,user:2,model:5,color:6,size:7,qty:8,cutter:12,sewer:13,sewn:14,payet:15,payetSubmitted:16,useColorStatus:true};
// Format TikTok A-O: tidak ada username; B adalah ID pesanan, sedangkan J adalah batas kirim.
const tiktok={rowNumber:0,number:0,id:1,date:2,model:4,color:5,size:6,qty:7,due:9,cutter:10,sewer:11,sewn:12,payet:13,payetSubmitted:14,useColorStatus:true};
const columnsFor=channel=>channel==='WhatsApp'?whatsapp:channel==='TikTok'?tiktok:shopee;
const divisionFor=stage=>stage==='Belum mulai'?'Belum Produksi':stage==='Pemotong'?'Penjahit':stage==='Penjahit'?'Setor Jahit':stage==='Setor Jahit'?'Payet':stage==='Payet'?'Setor Payet':'Siap Kirim';
function categoryFor(model){const value=String(model||'').toLowerCase();if(/bros/.test(value))return 'Bros';if(/hijab|jilbab|slendang|selendang/.test(value))return 'Jilbab & Slendang';if(/rok/.test(value))return 'Rok';if(/kemeja/.test(value))return 'Kemeja';return 'Atasan'}
function isHeaderRow(c,columns){const model=val(c[columns.model]).toUpperCase(),number=val(c[columns.number]).toUpperCase(),id=columns.id===undefined?'':val(c[columns.id]).toUpperCase(),date=val(c[columns.date]).toUpperCase();return ['MODEL','PESANAN'].includes(model)||['NO','NO.','NOMOR'].includes(number)||id.includes('ID PESANAN')||['TGL PESAN','TANGGAL PESAN','TANGGAL'].includes(date)}
function statusShade(c,columns){if(!columns.useColorStatus)return 'white';const indices=[columns.rowNumber,columns.number,columns.id,columns.user,columns.model].filter(index=>index!==undefined);const preferred=indices.map(index=>color(c[index])).find(shade=>shade!=='white');if(preferred)return preferred;const allShades=(c||[]).map(color);return ['red','green','orange','purple'].find(shade=>allShades.includes(shade))||'white'}
function mergeShadeFor(rowIndex,rows,merges){
 for(const merge of merges||[]){
  const startRow=merge.startRowIndex??0,endRow=merge.endRowIndex??startRow+1;
  const startColumn=merge.startColumnIndex??0,endColumn=merge.endColumnIndex??startColumn+1;
  if(rowIndex<startRow||rowIndex>=endRow)continue;
  // Google stores a merged range's formatting only in the top-left cell in some
  // sheets, but in other sheets it can exist on any cell in the merged region.
  // Search the complete region so every product line inherits its order status.
  for(let sourceRow=startRow;sourceRow<endRow;sourceRow++){
   for(let column=startColumn;column<endColumn;column++){
    const shade=color(rows[sourceRow]?.values?.[column]);
    if(shade!=='white')return shade;
   }
  }
 }
 return 'white'
}
function carry(rows,columns,merges){let last={};return rows.map((row,i)=>{const c=row.values||[];const current={rowNumber:columns.rowNumber===undefined?'':val(c[columns.rowNumber]),number:val(c[columns.number]),id:columns.id===undefined?'':val(c[columns.id]),username:val(c[columns.user]),orderDate:val(c[columns.date]),due:columns.due===undefined?'':val(c[columns.due])};if(Object.values(current).some(Boolean)){const startsOrder=!!(current.rowNumber||current.number||current.id);const detectedShade=[statusShade(c,columns),mergeShadeFor(i,rows,merges)].find(shade=>shade!=='white')||'white';const shade=columns.useColorStatus?(detectedShade!=='white'?detectedShade:(startsOrder?'white':last.shade||'white')):'white';last={rowNumber:current.rowNumber||last.rowNumber,number:current.number||last.number,id:current.id||last.id,username:current.username||last.username,orderDate:current.orderDate||last.orderDate,due:current.due||last.due,shade}}return {c,last:{...last},i}})}
export function mapRows(rows,channel,year,merges=[]){const columns=columnsFor(channel);return carry(rows,columns,merges).filter(({c})=>val(c[columns.model])&&!isHeaderRow(c,columns)).map(({c,last,i})=>{const v=j=>val(c[j]);const cutter=v(columns.cutter),sewer=v(columns.sewer),sewn=v(columns.sewn),payet=v(columns.payet),submittedPayet=v(columns.payetSubmitted);const needsPayet=!!payet||!!submittedPayet;const stage=submittedPayet?'Setor Payet':payet?'Payet':sewn?'Setor Jahit':sewer?'Penjahit':cutter?'Pemotong':'Belum mulai';const detectedShade=[statusShade(c,columns),mergeShadeFor(i,rows,merges)].find(shade=>shade!=='white')||'white';const shade=detectedShade==='white'?(last.shade||'white'):detectedShade;const date=dateParse(last.orderDate,year);const express=shade==='orange',cancelled=shade==='red';const model=v(columns.model),req=columns.req===undefined?'':v(columns.req);const emptyPackage=shade==='green'||/paket\s*kosong|belum\s*balas/i.test(`${req} ${model}`);const timeline=[['Pemotong',cutter],['Penjahit',sewer],['Setor Jahit',sewn],['Payet',payet],['Setor Payet',submittedPayet]].map(([label,value])=>({label,value,completed:!!value}));return {key:`${channel}-${i}`,channel,rowNumber:last.rowNumber,number:last.number,id:last.id||null,username:last.username,model,category:categoryFor(model),warna:v(columns.color),size:v(columns.size),qty:Math.max(1,Number(v(columns.qty))||1),req,date,due:plusDays(date,express?7:14),stage,finished:needsPayet?!!submittedPayet:!!sewn,needsPayet,shipped:shade==='purple',cancelled,emptyPackage,express,shade,division:divisionFor(stage),timeline}});}
