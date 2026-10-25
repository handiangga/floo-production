import StatsCards from '../components/dashboard/StatsCards';
import OrdersOverview from '../components/dashboard/OrdersOverview';
import DeadlinePanel from '../components/dashboard/DeadlinePanel';
import ProductionCharts from '../components/dashboard/ProductionCharts';
import WorkloadPanel from '../components/dashboard/WorkloadPanel';
import { sumQty } from '../hooks/useMonitoring';
export default function DashboardPage({ items, work, ready, overdue, deadlines, unstarted, today, query, onQuery, onDetail, onOpenReports, onOpenDeadlineDate, onOpenDivision, onOpenMonitoring }) { const stats = { unshipped: sumQty(items.filter(x => !x.shipped)), ready: sumQty(ready), overdue: sumQty(overdue) }; return <><StatsCards items={items} work={work} ready={ready} today={today} onOpenMonitoring={onOpenMonitoring} /><div className="dashboard-main"><OrdersOverview items={items} today={today} query={query} onQuery={onQuery} onDetail={onDetail} stats={stats} deadlines={deadlines} unstarted={unstarted} overdue={overdue} /><DeadlinePanel deadlines={deadlines} today={today} onOpenReports={onOpenReports} onOpenDeadlineDate={onOpenDeadlineDate} onOpenDivision={onOpenDivision} /></div><WorkloadPanel work={work} ready={ready} today={today} /><ProductionCharts items={items} work={work} /></>; }
