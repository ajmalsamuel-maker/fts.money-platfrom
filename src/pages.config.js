import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Merchants from './pages/Merchants';
import Terminals from './pages/Terminals';
import Settlements from './pages/Settlements';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Transactions": Transactions,
    "Merchants": Merchants,
    "Terminals": Terminals,
    "Settlements": Settlements,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};