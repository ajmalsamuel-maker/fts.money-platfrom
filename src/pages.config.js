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
import PaymentOrchestration from './pages/PaymentOrchestration';
import Chargebacks from './pages/Chargebacks';
import MerchantSelfOnboarding from './pages/MerchantSelfOnboarding';
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
    "PaymentOrchestration": PaymentOrchestration,
    "Chargebacks": Chargebacks,
    "MerchantSelfOnboarding": MerchantSelfOnboarding,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};