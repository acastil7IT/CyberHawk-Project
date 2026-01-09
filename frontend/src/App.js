import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  AlertOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  BugOutlined,
  WifiOutlined,
  SafetyOutlined
} from '@ant-design/icons';

import Dashboard from './components/Dashboard';
import Incidents from './components/Incidents';
import NetworkTraffic from './components/NetworkTraffic';
import LiveAlerts from './components/LiveAlerts';
import AdvancedScanning from './components/AdvancedScanning';
import NetworkDiscovery from './components/NetworkDiscovery';

import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Command Center',
    },
    {
      key: '/incidents',
      icon: <AlertOutlined />,
      label: 'Threat Intelligence',
    },
    {
      key: '/traffic',
      icon: <GlobalOutlined />,
      label: 'Network Monitor',
    },
    {
      key: '/alerts',
      icon: <SecurityScanOutlined />,
      label: 'Live Threats',
    },
    {
      key: '/advanced-scanning',
      icon: <BugOutlined />,
      label: 'Cyber Arsenal',
    },
    {
      key: '/network-discovery',
      icon: <WifiOutlined />,
      label: 'Asset Discovery',
    },
  ];

  return (
    <Router>
      <Layout className="securenet-layout" style={{ minHeight: '100vh' }}>
        {/* Demo Banner */}
        <div className="demo-banner">
          <SafetyOutlined style={{ marginRight: 8 }} />
          CyberHawk v3.0 | Intelligent Threat Hunting Platform | Alejandro Castillo - Cybersecurity Portfolio
        </div>
        
        <Sider
          className="securenet-sider"
          width={200}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div className="logo">
            <SafetyOutlined style={{ fontSize: '24px', color: 'white' }} />
            <span className="logo-text">CyberHawk</span>
          </div>
          <Menu
            className="securenet-menu"
            mode="inline"
            defaultSelectedKeys={['/']}
            items={menuItems}
            onClick={({ key }) => {
              window.location.pathname = key;
            }}
          />
        </Sider>
        
        <Layout>
          <Header className="securenet-header">
            <div className="header-title">
              CyberHawk Security Operations Center
            </div>
          </Header>
          
          <Content className="securenet-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/traffic" element={<NetworkTraffic />} />
              <Route path="/alerts" element={<LiveAlerts />} />
              <Route path="/advanced-scanning" element={<AdvancedScanning />} />
              <Route path="/network-discovery" element={<NetworkDiscovery />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;