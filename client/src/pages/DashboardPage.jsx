import StatsCards from '../components/dashboard/StatsCards';
import OrdersOverview from '../components/dashboard/OrdersOverview';
import DeadlinePanel from '../components/dashboard/DeadlinePanel';
import ProductionCharts from '../components/dashboard/ProductionCharts';
import { sumQty } from '../hooks/useMonitoring';
export default function DashboardPage({ items, work, ready, deadlines, today, query, onQuery, onDetail, onOpenReports }) { const stats = { unshipped: sumQty(items.filter(x => !x.shipped)), ready: sumQty(ready), overdue: sumQty(work.filter(x => x.due && x.due < today)) }; return <><StatsCards items={items} work={work} ready={ready} today={today} /><div className="dashboard-main"><OrdersOverview items={items} today={today} query={query} onQuery={onQuery} onDetail={onDetail} stats={stats} /><DeadlinePanel deadlines={deadlines} today={today} onOpenReports={onOpenReports} /></div><ProductionCharts items={items} work={work} /></>; }
