import { monthNames, abbrev, mapRows } from '../utils/orders.js';
export async function loadSource(sheets,id,channel,month,year){
 if(!id)return {items:[],warning:`${channel}: ID spreadsheet belum diisi`};
 const meta=await sheets.spreadsheets.get({spreadsheetId:id,fields:'sheets(properties(title,gridProperties(rowCount)))'});
 const sheetMetadata=meta.data.sheets||[];
 const titles=sheetMetadata.map(x=>x.properties.title);
 const target=titles.find(t=>{const s=t.toUpperCase().replace(/[^A-Z0-9]/g,'');return (s.includes(monthNames[month-1])||s.includes(abbrev[month-1]))&&(!/\d{2,4}/.test(s)||s.includes(String(year).slice(-2))||s.includes(String(year)))});
 if(!target)return {items:[],warning:`${channel}: tab bulan ${monthNames[month-1]} ${year} tidak ditemukan`};
 const escaped=target.replace(/'/g,"''");const targetMetadata=sheetMetadata.find(x=>x.properties.title===target);const rowCount=Math.min(targetMetadata?.properties?.gridProperties?.rowCount||5000,12000);
 const r=await sheets.spreadsheets.get({spreadsheetId:id,ranges:[`'${escaped}'!A1:O${rowCount}`],includeGridData:true,fields:'sheets(data(rowData(values(formattedValue,effectiveFormat(backgroundColor),userEnteredFormat(backgroundColor)))))'});
 const rows=r.data.sheets?.[0]?.data?.[0]?.rowData||[];
 return {items:mapRows(rows,channel,year),tab:target};
}
