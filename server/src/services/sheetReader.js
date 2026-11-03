import { monthNames, abbrev, mapRows } from '../utils/orders.js';
export function selectMonthTab(titles, month, year){
 const monthName=monthNames[month-1], monthAbbrev=abbrev[month-1], fullYear=String(year), shortYear=fullYear.slice(-2);
 const normalize = title => title.toUpperCase().trim().replace(/[\s_-]+/g, '');
 const names = [monthName, monthAbbrev];
 const datedNames = names.flatMap(name => [name + fullYear, name + shortYear]);
 return titles.find(title => datedNames.includes(normalize(title)))
   || titles.find(title => names.includes(normalize(title)))
   || null;
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
