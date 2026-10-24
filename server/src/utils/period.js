import { nowMonth } from './orders.js';

const periodPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export function requestedPeriod(value) {
  return periodPattern.test(value || '') ? value : nowMonth();
}
