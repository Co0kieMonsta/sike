import DashboardPageView from "./page-view";
import { getDictionary } from "@/app/dictionaries";
import { redirect } from 'next/navigation';

const Dashboard = async ({ params }) => {
  redirect('/financedash');
  const { lang } = await params;
  const trans = await getDictionary(lang);
  return <DashboardPageView trans={trans} />;
};

export default Dashboard;
