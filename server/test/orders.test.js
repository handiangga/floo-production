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

test('mapRows recognizes the mauve purple used by the Shopee sheet as shipped', () => {
  const mauve = formattedValue => ({ formattedValue, effectiveFormat: { backgroundColor: { red: 0.82, green: 0.63, blue: 0.72 } } });
  const row = { values: [mauve('5153'), mauve('260929BHDKCEF3'), mauve('29 September'), mauve('nadeaaa13'), mauve('Rahayu'), mauve('Sage'), mauve('S'), mauve('1')] };
  assert.equal(mapRows([row], 'Shopee', 2026)[0].shipped, true);
});

test('mapRows recognizes vivid orange and carries express status to product lines', () => {
  const orange = formattedValue => ({ formattedValue, effectiveFormat: { backgroundColor: { red: 1, green: 0.43, blue: 0 } } });
  const blank = formattedValue => ({ formattedValue });
  const order = { values: [orange('5651'), orange('261018G4046WH'), orange('18 Oktober'), orange('rahmhum'), blank(''), blank(''), blank(''), blank('1')] };
  const product = { values: [blank(''), blank(''), blank(''), blank(''), orange('Kemaja batik'), orange('Haris'), orange('XXL'), orange('1')] };
  const rows = mapRows([order, product], 'Shopee', 2026);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].express, true);
  assert.equal(rows[0].due, '2026-10-25');
});

test('mapRows reads express shade from a merged parent cell', () => {
  const orange = formattedValue => ({ formattedValue, effectiveFormat: { backgroundColor: { red: 1, green: 0.43, blue: 0 } } });
  const blank = formattedValue => ({ formattedValue });
  const parent = { values: [orange('5700'), blank('261021J1EECHV'), blank('21 Oktober'), blank('putri_hidyah'), blank(''), blank(''), blank(''), blank('')] };
  const product = { values: [blank(''), blank(''), blank(''), blank(''), blank('Anjani'), blank('Denim layer putih'), blank('MK'), blank('1')] };
  const mergedRows = [{ startRowIndex: 0, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 1 }];
  const rows = mapRows([parent, product], 'Shopee', 2026, mergedRows);
  assert.equal(rows[0].express, true);
  assert.equal(rows[0].due, '2026-10-28');
});

test('mapRows detects cancelled and empty-package statuses from row colors and request text', () => {
  const colored = (formattedValue, backgroundColor) => ({ formattedValue, effectiveFormat: { backgroundColor } });
  const plain = formattedValue => ({ formattedValue });
  const cancelled = { values: [colored('5191', { red: 0.75, green: 0, blue: 0 }), plain('261001G923GPS1'), plain('1 Oktober'), plain('user'), plain('Puspa'), plain('Coffe'), plain('M'), plain('1')] };
  const emptyPackage = { values: [colored('5203', { red: 0, green: 1, blue: 0 }), plain('261002HMFOH2PF'), plain('2 Oktober'), plain('user'), plain('Cempaka'), plain('Sage'), plain('XXL'), plain('1'), plain('PAKET KOSONG, BELUM BALES')] };
  const rows = mapRows([cancelled, emptyPackage], 'Shopee', 2026);
  assert.equal(rows[0].cancelled, true);
  assert.equal(rows[1].emptyPackage, true);
});

test('mapRows accepts soft red and green shades, including status inherited from a merged area', () => {
  const colored = (formattedValue, backgroundColor) => ({ formattedValue, effectiveFormat: { backgroundColor } });
  const plain = formattedValue => ({ formattedValue });
  const cancelledParent = { values: [plain(''), plain(''), plain(''), plain(''), colored('', { red: 0.88, green: 0.42, blue: 0.42 })] };
  const cancelledProduct = { values: [plain(''), plain(''), plain(''), plain(''), plain('Rok batik'), plain('Rahayu'), plain('L'), plain('1')] };
  const emptyParent = { values: [plain('5203'), plain('261002HMFOH2PF'), plain('2 Oktober'), plain('user'), colored('', { red: 0.38, green: 0.78, blue: 0.48 })] };
  const emptyProduct = { values: [plain(''), plain(''), plain(''), plain(''), plain('Cempaka'), plain('Sage'), plain('XXL'), plain('1')] };
  const merges = [
    { startRowIndex: 0, endRowIndex: 2, startColumnIndex: 4, endColumnIndex: 6 },
    { startRowIndex: 2, endRowIndex: 4, startColumnIndex: 4, endColumnIndex: 6 }
  ];
  const rows = mapRows([cancelledParent, cancelledProduct, emptyParent, emptyProduct], 'Shopee', 2026, merges);
  assert.equal(rows[0].cancelled, true);
  assert.equal(rows[1].emptyPackage, true);
});

test('mapRows treats the brown WhatsApp order colour as a regular order', () => {
  const brown = formattedValue => ({ formattedValue, effectiveFormat: { backgroundColor: { red: 0.47, green: 0.25, blue: 0.02 } } });
  const row = { values: [brown('501'), brown('2 Oktober 2026'), brown('Mutia'), brown('alamat'), brown('0897'), brown('Atasan rengganis'), brown('Buttercream'), brown('MB'), brown('1')] };
  const item = mapRows([row], 'WhatsApp', 2026)[0];
  assert.equal(item.cancelled, false);
  assert.equal(item.emptyPackage, false);
  assert.equal(item.express, false);
  assert.equal(item.shipped, false);
});

test('mapRows recognizes both standard Shopee cancellation reds', () => {
  const coloured = (formattedValue, backgroundColor) => ({ formattedValue, effectiveFormat: { backgroundColor } });
  const brightRed = { values: [coloured('5191', { red: 1, green: 0, blue: 0 }), coloured('261001G923GPS1', { red: 1, green: 0, blue: 0 }), coloured('1 Oktober', { red: 1, green: 0, blue: 0 }), coloured('user', { red: 1, green: 0, blue: 0 }), coloured('Puspa', { red: 1, green: 0, blue: 0 })] };
  const darkRed = { values: [coloured('5218', { red: 0.8, green: 0, blue: 0 }), coloured('261002JTWJPT3Q', { red: 0.8, green: 0, blue: 0 }), coloured('2 Oktober', { red: 0.8, green: 0, blue: 0 }), coloured('user', { red: 0.8, green: 0, blue: 0 }), coloured('Rok batik', { red: 0.8, green: 0, blue: 0 })] };
  const [first, second] = mapRows([brightRed, darkRed], 'Shopee', 2026);
  assert.equal(first.cancelled, true);
  assert.equal(second.cancelled, true);
});

test('mapRows recognizes the deep-red TikTok cancellation palette', () => {
  const coloured = (formattedValue, backgroundColor) => ({ formattedValue, effectiveFormat: { backgroundColor } });
  const deepRed = { values: [coloured('2198', { red: 0.6, green: 0, blue: 0 }), coloured('586427136309233409', { red: 0.6, green: 0, blue: 0 }), coloured('7 Okt', { red: 0.6, green: 0, blue: 0 }), coloured('', { red: 0.6, green: 0, blue: 0 }), coloured('Rok Batik', { red: 0.6, green: 0, blue: 0 })] };
  const darkerRed = { values: [coloured('2212', { red: 0.4, green: 0, blue: 0 }), coloured('586444607119525460', { red: 0.4, green: 0, blue: 0 }), coloured('7 Okt', { red: 0.4, green: 0, blue: 0 }), coloured('', { red: 0.4, green: 0, blue: 0 }), coloured('Hanum', { red: 0.4, green: 0, blue: 0 })] };
  const [first, second] = mapRows([deepRed, darkerRed], 'TikTok', 2026);
  assert.equal(first.cancelled, true);
  assert.equal(second.cancelled, true);
});

test('selectMonthTab prioritizes the requested year over an older or generic tab', () => {
  assert.equal(selectMonthTab(['Oktober', 'Oktober 2025', 'Oktober 2026'], 10, 2026), 'Oktober 2026');
  assert.equal(selectMonthTab(['OKT 25', 'OKT 26'], 10, 2026), 'OKT 26');
  assert.equal(selectMonthTab(['Oktober'], 10, 2026), 'Oktober');
});
