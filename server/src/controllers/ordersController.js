import { getOrdersForPeriod } from '../services/ordersService.js';
import { requestedPeriod } from '../utils/period.js';

export async function orders(req, res) {
  const data = await getOrdersForPeriod(requestedPeriod(req.query.month));
  res.json(data);
}
