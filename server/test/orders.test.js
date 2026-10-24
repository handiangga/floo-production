import test from 'node:test';
import assert from 'node:assert/strict';
import { mapRows, nowMonth } from '../src/utils/orders.js';
import { requestedPeriod } from '../src/utils/period.js';
import { selectMonthTab } from '../src/services/sheetReader.js';

test('requestedPeriod accepts an ISO month and falls back for invalid input', () => {
  assert.equal(requestedPeriod('2026-10'), '2026-10');
  assert.equal(requestedPeriod('2026-13'), nowMonth());
  assert.equal(requestedPeriod('October'), nowMonth());
});

test('mapRows follows the Shopee column layout and carries order fields down', () => {
  const cell = formattedValue => ({ formattedValue });
  const firstRow = { values: [cell('5153'), cell('260929BHDKCEF3'), cell('29 September'), cell('nadeaaa13'), cell('Rahayu'), cell('Sage'), cell('S PB 75'), cell('1'), cell(''), cell('14 Oktober'), cell('en15/10'), cell('salim'), cell('17/10'), cell('bu hana 17/10'), cell('20/10') ] };
  const secondRow = { values: [cell(''), cell(''), cell(''), cell(''), cell('Rok'), cell('Navy'), cell('L'), cell('1'), cell(''), cell(''), cell(''), cell('Penjahit') ] };
  const rows = mapRows([firstRow, secondRow], 'Shopee', 2026);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].rowNumber, '5153');
  assert.equal(rows[1].number, '260929BHDKCEF3');
  assert.equal(rows[1].date, '2026-09-29');
  assert.equal(rows[1].due, '2026-10-13');
  assert.equal(rows[1].stage, 'Penjahit');
  assert.equal(rows[1].division, 'Setor Jahit');
});

test('mapRows normalizes the supplied WhatsApp A-Q layout', () => {
  const cell = formattedValue => ({ formattedValue });
  const source = { values: [cell('489'), cell('1 Oktober 2026'), cell('azzatulhidayah'), cell('Alamat tidak dipakai'), cell('013-3139-315'), cell('Rok songket'), cell('Tosca'), cell('XS'), cell('1'), cell('LION 85'), cell(''), cell('603.000'), cell(''), cell(''), cell(''), cell(''), cell('')] };
  const row = mapRows([source], 'WhatsApp', 2026)[0];
  assert.equal(row.number, '489');
  assert.equal(row.id, null);
  assert.equal(row.username, 'azzatulhidayah');
  assert.equal(row.model, 'Rok songket');
  assert.equal(row.warna, 'Tosca');
  assert.equal(row.size, 'XS');
  assert.equal(row.qty, 1);
  assert.equal(row.date, '2026-10-01');
  assert.equal(row.due, '2026-10-15');
  assert.equal(row.shipped, false);
});

test('mapRows normalizes TikTok rows without a username', () => {
  const cell = formattedValue => ({ formattedValue });
  const firstItem = { values: [cell('2107'), cell('586314125222839450'), cell('1 Okt'), cell(''), cell('Kencana'), cell('Silver Mix Abu Tua'), cell('S'), cell('1'), cell(''), cell('12 Oktober'), cell('en7/10'), cell('dk'), cell(''), cell(''), cell('')] };
  const secondItem = { values: [cell(''), cell(''), cell(''), cell(''), cell('Rok Songket'), cell('Silver'), cell('S'), cell('1'), cell(''), cell('12 Oktober'), cell(''), cell(''), cell(''), cell(''), cell('')] };
  const rows = mapRows([firstItem, secondItem], 'TikTok', 2026);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].rowNumber, '2107');
  assert.equal(rows[0].number, '2107');
  assert.equal(rows[0].id, '586314125222839450');
  assert.equal(rows[0].username, undefined);
  assert.equal(rows[0].due, '2026-10-15');
  assert.equal(rows[0].stage, 'Penjahit');
  assert.equal(rows[1].id, '586314125222839450');
  assert.equal(rows[1].shipped, false);
});

test('mapRows skips a TikTok header row', () => {
  const cell = formattedValue => ({ formattedValue });
  const header = { values: [cell('NO.'), cell('ID PEMESANAN'), cell('TGL PESAN'), cell('REQ TANGGAL PEMAKAIAN'), cell('PESANAN'), cell('WARNA'), cell('SIZE'), cell('QTY'), cell('KETERANGAN'), cell('MAX KIRIM'), cell('POTONG'), cell('JAHIT'), cell('SETOR JAHIT'), cell('PAYET'), cell('SETOR PAYET')] };
  const item = { values: [cell('2107'), cell('586314125222839450'), cell('1 Okt'), cell(''), cell('Kencana'), cell('Silver Mix Abu Tua'), cell('S'), cell('1'), cell(''), cell('12 Oktober')] };
  assert.equal(mapRows([header, item], 'TikTok', 2026).length, 1);
});

test('mapRows uses the source colors for shipment status and calculated deadlines', () => {
  const colored = (formattedValue, backgroundColor) => ({ formattedValue, effectiveFormat: { backgroundColor } });
  const regular = { values: [colored('5153', { red: 1, green: 1, blue: 1 }), colored('260929BHDKCEF3', { red: 1, green: 1, blue: 1 }), colored('29 September', { red: 1, green: 1, blue: 1 }), colored('nadeaaa13', { red: 1, green: 1, blue: 1 }), colored('Rahayu', { red: 1, green: 1, blue: 1 }), colored('Sage', { red: 1, green: 1, blue: 1 }), colored('S', { red: 1, green: 1, blue: 1 }), colored('1', { red: 1, green: 1, blue: 1 })] };
  const express = { values: [colored('5154', { red: 0.99, green: 0.9, blue: 0.8 }), colored('260930', { red: 0.99, green: 0.9, blue: 0.8 }), colored('29 September', { red: 0.99, green: 0.9, blue: 0.8 }), colored('user', { red: 0.99, green: 0.9, blue: 0.8 }), colored('Puspa', { red: 0.99, green: 0.9, blue: 0.8 }), colored('Navy', { red: 0.99, green: 0.9, blue: 0.8 }), colored('S', { red: 0.99, green: 0.9, blue: 0.8 }), colored('1', { red: 0.99, green: 0.9, blue: 0.8 })] };
  const shipped = { values: [colored('5155', { red: 0.85, green: 0.82, blue: 0.91 }), colored('260931', { red: 0.85, green: 0.82, blue: 0.91 }), colored('29 September', { red: 0.85, green: 0.82, blue: 0.91 }), colored('user', { red: 0.85, green: 0.82, blue: 0.91 }), colored('Kencana', { red: 0.85, green: 0.82, blue: 0.91 }), colored('Navy', { red: 0.85, green: 0.82, blue: 0.91 }), colored('S', { red: 0.85, green: 0.82, blue: 0.91 }), colored('1', { red: 0.85, green: 0.82, blue: 0.91 })] };
  const [regularRow, expressRow, shippedRow] = mapRows([regular, express, shipped], 'Shopee', 2026);
  assert.equal(regularRow.due, '2026-10-13');
  assert.equal(regularRow.shipped, false);
  assert.equal(expressRow.express, true);
  assert.equal(expressRow.due, '2026-10-06');
  assert.equal(shippedRow.shipped, true);
});

test('selectMonthTab prioritizes the requested year over an older or generic tab', () => {
  assert.equal(selectMonthTab(['Oktober', 'Oktober 2025', 'Oktober 2026'], 10, 2026), 'Oktober 2026');
  assert.equal(selectMonthTab(['OKT 25', 'OKT 26'], 10, 2026), 'OKT 26');
  assert.equal(selectMonthTab(['Oktober'], 10, 2026), 'Oktober');
});
