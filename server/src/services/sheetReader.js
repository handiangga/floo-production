import { monthNames, abbrev, mapRows } from '../utils/orders.js';
export function selectMonthTab(titles, month, year){
 const monthName=monthNames[month-1], monthAbbrev=abbrev[month-1], fullYear=String(year), shortYear=fullYear.slice(-2);
 const candidates=titles.filter(title=>{const normalized=title.toUpperCase().replace(/[^A-Z0-9]/g,'');return normalized.includes(monthName)||normalized.includes(monthAbbrev)});
 const hasRequestedYear=title=>{const normalized=title.toUpperCase().replace(/[^A-Z0-9]/g,'');return normalized.includes(fullYear)||normalized.includes(shortYear)};
 // Prefer a tab explicitly labeled with the requested year. A generic monthly tab is only a fallback.
 return candidates.find(hasRequestedYear)||candidates.find(title=>!/\d{2,4}/.test(title.replace(/[^A-Z0-9]/gi,'')))||null;
}
export async function loadSource(sheets,id,channel,month,year){
 if(!id)return {items:[],warning:`${channel}: ID spreadsheet belum diisi`};
 const meta=await sheets.spreadsheets.get({spreadsheetId:id,fields:'sheets(properties(title,gridProperties(rowCount)))'});
 const sheetMetadata=meta.data.sheets||[];
 const titles=sheetMetadata.map(x=>x.properties.title);
 const target=selectMonthTab(titles,month,year);
 if(!target)return {items:[],warning:`${channel}: tab bulan ${monthNames[month-1]} ${year} tidak ditemukan`};
 const escaped=target.replace(/'/g,"''");const targetMetadata=sheetMetadata.find(x=>x.properties.title===target);const rowCount=Math.min(targetMetadata?.properties?.gridProperties?.rowCount||5000,12000);
 const r=await sheets.spreadsheets.get({spreadsheetId:id,ranges:[`'${escaped}'!A1:Q${rowCount}`],includeGridData:true,fields:'sheets(merges,data(rowData(values(formattedValue,effectiveFormat(backgroundColor,backgroundColorStyle),userEnteredFormat(backgroundColor,backgroundColorStyle)))))'});
 const rows=r.data.sheets?.[0]?.data?.[0]?.rowData||[];
 const merges=r.data.sheets?.[0]?.merges||[];
 return {items:mapRows(rows,channel,year,merges),tab:target};
}
