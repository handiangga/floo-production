import {api} from './api';
export const getOrders=month=>api('/api/orders?month='+encodeURIComponent(month));
