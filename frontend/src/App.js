import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UploadOutlined,
  SecurityScanOutlined,
  BugOutlined,
  SafetyOutlined
} from '@ant-design/icons';

import Dashboard from './components/Dashboard';
import ScanUpload from './components/ScanUpload';
import LiveAlerts from './components/LiveAlerts';
import Incidents from './components/Incidents';

import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Security Dashboard',
    },
    {
      key: '/scan-upload',
      icon: <UploadOutlined />,
      label: 'Scan Upload',
    },
    {
      key: '/incidents',
      icon: <BugOutlined />,
      label: 'Security Incidents',
    },
    {
      key: '/alerts',
      icon: <SecurityScanOutlined />,
      label: 'Live Alerts',
    },
  ];

  return (
    <Router>
      <Layout className="cyberhawk-layout" style={{ minHeight: '100vh' }}>
        <Sider
          className="cyberhawk-sider"
          width={240}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div className="logo">
            <SafetyOutlined style={{ fontSize: '28px', color: '#00d4ff' }} />
            <span className="logo-text">CyberHawk</span>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
              Defensive Analysis
            </div>
          </div>
          
          <Menu
            className="cyberhawk-menu"
            mode="inline"
            defaultSelectedKeys={[window.location.pathname]}
            items={menuItems}
            onClick={({ key }) => {
              window.location.pathname = key;
            }}
          />
        </Sider>
        
        <Layout>
          <Header className="cyberhawk-header">
            <div className="header-title">
              <h2 style={{ margin: 0, color: '#1e293b' }}>
                CyberHawk Defensive Security Analysis Platform
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Network Security Analysis & Scan Result Ingestion
              </div>
            </div>
          </Header>
          
          <Content className="cyberhawk-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scan-upload" element={<ScanUpload />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/alerts" element={<LiveAlerts />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;