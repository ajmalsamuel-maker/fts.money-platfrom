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
import MerchantCredentials from './pages/MerchantCredentials';
import AcquirerOnboarding from './pages/AcquirerOnboarding';
import APMOnboarding from './pages/APMOnboarding';
import AIDisputeResolution from './pages/AIDisputeResolution';
import SmartOrchestration from './pages/SmartOrchestration';
import UserManagement from './pages/UserManagement';
import Approvals from './pages/Approvals';
import Appearance from './pages/Appearance';
import VirtualTerminals from './pages/VirtualTerminals';
import MerchantUsers from './pages/MerchantUsers';
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
    "MerchantCredentials": MerchantCredentials,
    "AcquirerOnboarding": AcquirerOnboarding,
    "APMOnboarding": APMOnboarding,
    "AIDisputeResolution": AIDisputeResolution,
    "SmartOrchestration": SmartOrchestration,
    "UserManagement": UserManagement,
    "Approvals": Approvals,
    "Appearance": Appearance,
    "VirtualTerminals": VirtualTerminals,
    "MerchantUsers": MerchantUsers,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};