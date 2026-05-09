import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LibraryDashboard from './features/library/components/LibraryDashboard';
import CreateSetPage from './features/create/components/CreateSetPage';
import StudyPage from './features/study/components/StudyPage';
import AccountPage from './features/account/components/AccountPage';
import HelpPage from './features/help/components/HelpPage';
import DailyReviewPage from './features/dailyReview/components/DailyReviewPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LibraryDashboard />} />
            <Route path="/create" element={<CreateSetPage />} />
            <Route path="/edit/:id" element={<CreateSetPage />} />
            <Route path="/study/:id" element={<StudyPage />} />
            <Route path="/daily" element={<DailyReviewPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
