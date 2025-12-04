import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Merchants from './pages/Merchants';
import Terminals from './pages/Terminals';
import Settlements from './pages/Settlements';
import MerchantOnboarding from './pages/MerchantOnboarding';
import Analytics from './pages/Analytics';
import Disputes from './pages/Disputes';
import FraudPrevention from './pages/FraudPrevention';
import Compliance from './pages/Compliance';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Transactions": Transactions,
    "Merchants": Merchants,
    "Terminals": Terminals,
    "Settlements": Settlements,
    "MerchantOnboarding": MerchantOnboarding,
    "Analytics": Analytics,
    "Disputes": Disputes,
    "FraudPrevention": FraudPrevention,
    "Compliance": Compliance,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};