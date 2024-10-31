import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FourSquare } from 'react-loading-indicators';
import { Home, LayoutDashboard, CreditCard, MessageCircle, Calendar, FileText, User, FileQuestion } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { apiService } from '../../services/apiService';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardCard = ({ icon, title, to }) => {
  const { isDarkMode } = useTheme();
  return (
    <Link to={to} className={`flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} rounded-lg shadow-lg transition-colors duration-200`}>
      {React.cloneElement(icon, { className: `w-10 h-10 ${isDarkMode ? 'text-tanish-dark' : 'text-tanish-light'}` })}
      <h5 className={`mt-4 text-xl font-semibold tracking-tight ${isDarkMode ? 'text-tanish-dark' : 'text-tanish-light'} text-center`}>{title}</h5>
    </Link>
  );
};

const AccountCard = ({ accountInfo }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'} rounded-lg shadow-md h-full border border-darkolive`}>
      <p className={`mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>Account Number: {accountInfo.ACCOUNT_ID}</p>
      <p className={`mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
        Property Address: {`${accountInfo.UNIT} ${accountInfo.STREET}, ${accountInfo.CITY}, ${accountInfo.STATE} ${accountInfo.ZIP_CODE}`}
      </p>
      <p className={`mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
        Current Balance: ${parseFloat(accountInfo.BALANCE).toFixed(2)}
      </p>
    </div>
  );
};


const ChargesCard = ({ charges }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'} rounded-lg shadow-md h-full border border-darkolive`}>
      <ul className={`space-y-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
        {charges.map((charge) => (
          <li key={charge.CHARGE_ID}>
            <span className="text-sm">{charge.DESCRIPTION} - ${parseFloat(charge.AMOUNT).toFixed(2)} - Due: {new Date(charge.DUE_DATE).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const UpdateItem = ({ item }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`mb-4 p-4 rounded-lg shadow-lg ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'}`}>
      <div className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h6 className={`font-bold ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
            {item.title}
          </h6>
          <span className={`text-xs px-2 py-1 rounded bg-darkblue-dark text-tanish-light`}>
            {item.type === 'announcement' ? 'News' : 'Document'}
          </span>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-darkolive' : 'text-darkblue-dark'}`}>
          {item.content}
        </p>
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-dark'}`}>
          {new Date(item.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const RecentUpdates = ({ updates }) => {
  const { isDarkMode } = useTheme();

  // Get only the last 3 updates
  const latestUpdates = updates.slice(0, 3);

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'}`}>
      <h5 className={`mb-4 text-2xl text-center font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
        Recent Updates
      </h5>
      <div className="space-y-4">
        {latestUpdates.map((item, index) => (
          <UpdateItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isCollapsed] = useSidebar();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        const response = await apiService.getDashboard();
        console.log('Dashboard data received:', response);
        setDashboardData(response);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={`flex min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'}`}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          {isDarkMode && (<FourSquare color='#D6C6B0' size="large" text="Loading" textColor="#D6C6B0"/>)}
          {!isDarkMode && (<FourSquare color='#2A3A4A' size="large" text="Loading" textColor="#2A3A4A"/>)}
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  const { accountInfo, recentCharges, recentUpdates } = dashboardData;

  return (
    <div className={`flex rounded-lg ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} rounded-lg shadow-lg`}>
      <Sidebar />
      <div className={`flex-1 m-4 md:m-10 pt-16 md:pt-0`}>
        {/* New Header Section */}
        <div className="mb-6 md:mb-10">
          <div className="mb-6 md:mb-10 flex justify-center">
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              Member Dashboard
            </h1>
          </div>
        </div>

        {/* Rest of the dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">
          <div className="lg:col-span-3 space-y-6 md:space-y-10">
            <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'} p-4 md:p-6 rounded-lg shadow-md`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Information Column */}
                <div className="flex flex-col">
                  <h5 className={`mb-4 text-xl md:text-2xl text-center font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                    Account Information
                  </h5>
                  <div className={`flex-1 ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'} rounded-lg shadow-lg h-full p-4`}>
                    <p className={`mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                      Account Number: {accountInfo.ACCOUNT_ID}
                    </p>
                    <p className={`mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                      Property Address: {`${accountInfo.UNIT} ${accountInfo.STREET}, ${accountInfo.CITY}, ${accountInfo.STATE} ${accountInfo.ZIP_CODE}`}
                    </p>
                    <p className={`mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                      Current Balance: ${parseFloat(accountInfo.BALANCE).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Recent Charges Column */}
                <div className="flex flex-col">
                  <h5 className={`mb-4 text-xl md:text-2xl text-center font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                    Recent Charges
                  </h5>
                  <div className={`flex-1 ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'} rounded-lg shadow-lg h-full p-4`}>
                    <ul className={`space-y-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                      {recentCharges.map((charge) => (
                        <li key={charge.CHARGE_ID}>
                          <span className="text-sm">
                            {charge.DESCRIPTION} - ${parseFloat(charge.AMOUNT).toFixed(2)} - Due: {new Date(charge.DUE_DATE).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'} p-4 md:p-6 rounded-lg shadow-md`}>
              <h2 className={`text-xl md:text-2xl text-center font-bold mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Quick Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <DashboardCard icon={<User />} title="Owner Info" to="/owner-info" />
                <DashboardCard icon={<CreditCard />} title="View or Make Payments" to="/payments" />
                <DashboardCard icon={<MessageCircle />} title="Messages" to="/messages" />
                <DashboardCard icon={<Calendar />} title="News & Events" to="/news-events" />
                <DashboardCard icon={<FileText />} title="Documents" to="/documents" />
                <DashboardCard icon={<FileQuestion />} title="Surveys" to="/surveys" />
              </div>
            </div>
          </div>
          <div className={`lg:col-span-1 ${isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'} rounded-lg shadow-lg`}>
            <RecentUpdates updates={recentUpdates} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;