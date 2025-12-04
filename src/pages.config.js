import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Merchants from './pages/Merchants';
import Terminals from './pages/Terminals';
import Settlements from './pages/Settlements';
import MerchantOnboarding from './pages/MerchantOnboarding';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Transactions": Transactions,
    "Merchants": Merchants,
    "Terminals": Terminals,
    "Settlements": Settlements,
    "MerchantOnboarding": MerchantOnboarding,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};