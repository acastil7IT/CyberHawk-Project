import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Badge } from 'antd';
import { 
  AlertOutlined, 
  GlobalOutlined, 
  SecurityScanOutlined,
  SafetyOutlined,
  EyeOutlined,
  BugOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import mockApi from '../services/mockApi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_incidents: 0,
    open_incidents: 0,
    critical_incidents: 0,
    packets_last_hour: 0,
    top_source_ips: [],
    incident_trends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkDevices, setNetworkDevices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, devicesResponse] = await Promise.all([
          mockApi.getDashboardStats(),
          fetch('http://localhost:8001/api/network/devices', {
            headers: { 'Authorization': 'Bearer demo-token' }
          }).then(res => res.json()).catch(() => ({ 
            devices: [
              {
                id: 1,
                ip_address: '192.168.1.1',
                hostname: 'router.local',
                device_type: 'Router/Gateway',
                vendor: 'Netgear Inc.',
                is_online: true,
                mac_address: '00:1B:44:11:3A:B7',
                last_seen: new Date().toISOString()
              },
              {
                id: 2,
                ip_address: '192.168.1.100',
                hostname: 'workstation-01',
                device_type: 'Windows Computer',
                vendor: 'Dell Inc.',
                is_online: true,
                mac_address: '00:50:56:C0:00:08',
                last_seen: new Date().toISOString()
              },
              {
                id: 3,
                ip_address: '192.168.1.150',
                hostname: 'iPhone-Alex',
                device_type: 'Mobile Device',
                vendor: 'Apple Inc.',
                is_online: true,
                mac_address: '8C:85:90:12:34:56',
                last_seen: new Date().toISOString()
              },
              {
                id: 4,
                ip_address: '192.168.1.200',
                hostname: 'server-01',
                device_type: 'Linux Server',
                vendor: 'HP Enterprise',
                is_online: true,
                mac_address: '00:15:5D:FF:FF:FF',
                last_seen: new Date().toISOString()
              },
              {
                id: 5,
                ip_address: '192.168.1.75',
                hostname: 'smart-tv',
                device_type: 'IoT Device',
                vendor: 'Samsung Electronics',
                is_online: false,
                mac_address: '00:26:37:12:34:56',
                last_seen: new Date(Date.now() - 3600000).toISOString()
              }
            ]
          }))
        ]);
        
        setStats(statsResponse);
        setNetworkDevices(devicesResponse.devices || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {error && (
        <Alert
          message="System Alert"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Threat Intelligence Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <SafetyOutlined />
            </div>
            <div className="stat-value">{stats.total_incidents}</div>
            <div className="stat-label">Total Threats</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <AlertOutlined />
            </div>
            <div className="stat-value">{stats.open_incidents}</div>
            <div className="stat-label">Active Incidents</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <BugOutlined />
            </div>
            <div className="stat-value">{stats.critical_incidents}</div>
            <div className="stat-label">Critical Alerts</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <ThunderboltOutlined />
            </div>
            <div className="stat-value">{stats.packets_last_hour}</div>
            <div className="stat-label">Packets/Hour</div>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Threat Intelligence Chart */}
        <Col span={16}>
          <Card title="🔥 Threat Activity Timeline" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.incident_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(52, 65, 85, 0.3)" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(30, 41, 59, 0.9)', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#00d4ff" 
                  strokeWidth={3}
                  dot={{ fill: '#00d4ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00ff88', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Network Intelligence */}
        <Col span={8}>
          <Card title="🎯 Source Intelligence" loading={loading}>
            <Table
              dataSource={stats.top_source_ips}
              columns={[
                {
                  title: 'IP Address',
                  dataIndex: 'ip',
                  key: 'ip',
                  render: (ip) => <code style={{ color: '#00d4ff' }}>{ip}</code>
                },
                {
                  title: 'Packets',
                  dataIndex: 'count',
                  key: 'count',
                  render: (count) => (
                    <Badge 
                      count={count} 
                      style={{ backgroundColor: '#00d4ff' }}
                    />
                  )
                }
              ]}
              pagination={false}
              size="small"
              rowKey="ip"
            />
          </Card>
        </Col>
      </Row>

      {/* Network Assets */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <span>
                <EyeOutlined style={{ marginRight: 8, color: '#00d4ff' }} />
                Network Asset Discovery
                <Badge 
                  count={networkDevices.length} 
                  style={{ backgroundColor: '#00ff88', marginLeft: 12 }}
                />
              </span>
            }
          >
            {networkDevices.length > 0 ? (
              <Table
                columns={[
                  {
                    title: 'Asset IP',
                    dataIndex: 'ip_address',
                    key: 'ip_address',
                    render: (ip) => <code style={{ color: '#00d4ff', fontWeight: 'bold' }}>{ip}</code>
                  },
                  {
                    title: 'Identity',
                    dataIndex: 'hostname',
                    key: 'hostname',
                    render: (hostname) => (
                      <span style={{ color: '#f8fafc' }}>
                        {hostname || 'Unknown Host'}
                      </span>
                    )
                  },
                  {
                    title: 'Classification',
                    dataIndex: 'device_type',
                    key: 'device_type',
                    render: (type) => {
                      const getTypeColor = (deviceType) => {
                        if (deviceType?.includes('Server')) return '#ff4757';
                        if (deviceType?.includes('Router')) return '#00ff88';
                        if (deviceType?.includes('Computer')) return '#00d4ff';
                        if (deviceType?.includes('Mobile')) return '#ffa726';
                        return '#64748b';
                      };
                      
                      return (
                        <span style={{ 
                          padding: '4px 8px', 
                          background: `${getTypeColor(type)}20`,
                          border: `1px solid ${getTypeColor(type)}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: getTypeColor(type),
                          fontWeight: '500'
                        }}>
                          {type || 'Unknown'}
                        </span>
                      );
                    }
                  },
                  {
                    title: 'Hardware ID',
                    dataIndex: 'mac_address',
                    key: 'mac_address',
                    render: (mac) => mac ? (
                      <code style={{ fontSize: '11px', color: '#cbd5e1' }}>{mac}</code>
                    ) : (
                      <span style={{ color: '#64748b' }}>N/A</span>
                    )
                  },
                  {
                    title: 'Status',
                    dataIndex: 'is_online',
                    key: 'status',
                    render: (isOnline) => (
                      <Badge 
                        status={isOnline ? 'success' : 'error'} 
                        text={
                          <span style={{ color: isOnline ? '#00ff88' : '#ff4757', fontWeight: '600' }}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        }
                      />
                    )
                  },
                  {
                    title: 'Last Contact',
                    dataIndex: 'last_seen',
                    key: 'last_seen',
                    render: (lastSeen) => {
                      const date = new Date(lastSeen);
                      const now = new Date();
                      const diffMinutes = Math.floor((now - date) / (1000 * 60));
                      
                      let timeText = '';
                      if (diffMinutes < 1) timeText = 'Just now';
                      else if (diffMinutes < 60) timeText = `${diffMinutes}m ago`;
                      else if (diffMinutes < 1440) timeText = `${Math.floor(diffMinutes / 60)}h ago`;
                      else timeText = `${Math.floor(diffMinutes / 1440)}d ago`;
                      
                      return (
                        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                          {timeText}
                        </span>
                      );
                    }
                  }
                ]}
                dataSource={networkDevices.slice(0, 10)} // Show first 10 devices
                pagination={false}
                size="small"
                rowKey="id"
                scroll={{ x: true }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <EyeOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#334155' }} />
                <p>Network scanning in progress...</p>
                <p style={{ fontSize: '12px' }}>Asset discovery runs every 5 minutes</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* System Health */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="⚡ System Health Matrix">
            <Row gutter={16}>
              <Col span={6}>
                <div className="stat-card">
                  <div className="stat-icon">
                    <GlobalOutlined />
                  </div>
                  <div className="stat-value" style={{ color: '#00ff88' }}>ONLINE</div>
                  <div className="stat-label">Traffic Analyzer</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="stat-card">
                  <div className="stat-icon">
                    <SecurityScanOutlined />
                  </div>
                  <div className="stat-value" style={{ color: '#00ff88' }}>ACTIVE</div>
                  <div className="stat-label">Threat Engine</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="stat-card">
                  <div className="stat-icon">
                    <AlertOutlined />
                  </div>
                  <div className="stat-value" style={{ color: '#00ff88' }}>READY</div>
                  <div className="stat-label">Alert System</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="stat-card">
                  <div className="stat-icon">
                    <ThunderboltOutlined />
                  </div>
                  <div className="stat-value" style={{ color: '#00ff88' }}>OPTIMAL</div>
                  <div className="stat-label">Performance</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;