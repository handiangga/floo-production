import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { getSheetsClient } from './googleSheets.js';
import { loadSource } from './sheetReader.js';

async function loadChannel(sheets, [channel, spreadsheetId], month, year) {
  try {
    return await loadSource(sheets, spreadsheetId, channel, month, year);
  } catch (error) {
    console.error('Sheet source failed:', { channel, message: error.message });
    return { items: [], warning: `${channel}: ${error.message}`, tab: null };
  }
}

export async function getOrdersForPeriod(period) {
  const [year, month] = period.split('-').map(Number);
  const configuredSources = Object.entries(env.sheetIds);
  if (!configuredSources.some(([, spreadsheetId]) => spreadsheetId)) {
    throw new AppError('ID spreadsheet belum dikonfigurasi', 503);
  }
  const sheets = getSheetsClient();
  const sources = await Promise.all(configuredSources.map(source => loadChannel(sheets, source, month, year)));
  return {
    month: period,
    items: sources.flatMap(source => source.items),
    warnings: sources.flatMap(source => source.warning ? [source.warning] : []),
    tabs: sources.map((source, index) => ({ channel: configuredSources[index][0], tab: source.tab || null })),
    updatedAt: new Date().toISOString()
  };
}
