import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Badge, Button, Upload, Modal, Form, Input, message, Tabs } from 'antd';
import { 
  AlertOutlined, 
  GlobalOutlined, 
  SecurityScanOutlined,
  SafetyOutlined,
  EyeOutlined,
  BugOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  FileTextOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_sessions: 0,
    total_hosts: 0,
    total_incidents: 0,
    critical_incidents: 0,
    high_risk_hosts: 0,
    recent_sessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scanSessions, setScanSessions] = useState([]);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, sessionsResponse, incidentsResponse] = await Promise.all([
        axios.get('http://localhost:8001/api/dashboard/stats', {
          headers: { 'Authorization': 'Bearer demo-token' }
        }).catch(() => ({ data: getMockStats() })),
        
        axios.get('http://localhost:8001/api/scan/sessions', {
          headers: { 'Authorization': 'Bearer demo-token' }
        }).catch(() => ({ data: { sessions: getMockSessions() } })),
        
        axios.get('http://localhost:8001/api/incidents', {
          headers: { 'Authorization': 'Bearer demo-token' }
        }).catch(() => ({ data: { incidents: getMockIncidents() } }))
      ]);
      
      setStats(statsResponse.data);
      setScanSessions(sessionsResponse.data.sessions || []);
      setIncidents(incidentsResponse.data.incidents || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMockStats = () => ({
    total_sessions: 3,
    total_hosts: 15,
    total_incidents: 5,
    critical_incidents: 1,
    high_risk_hosts: 4,
    recent_sessions: [
      {
        session_id: 'demo-session-001',
        filename: 'network_scan_demo.xml',
        created_at: new Date().toISOString(),
        total_hosts: 5,
        high_risk_ports: 8
      }
    ]
  });

  const getMockSessions = () => [
    {
      id: 1,
      session_id: 'demo-session-001',
      created_at: new Date().toISOString(),
      filename: 'network_scan_demo.xml',
      total_hosts: 5,
      total_open_ports: 23,
      high_risk_ports: 8,
      scan_command: 'nmap -sS -sV -O 192.168.1.0/24',
      notes: 'Demo scan session for portfolio showcase'
    }
  ];

  const getMockIncidents = () => [
    {
      id: 1,
      created_at: new Date().toISOString(),
      severity: 'CRITICAL',
      incident_type: 'Insecure Service',
      source_ip: '192.168.1.75',
      description: 'IoT camera with Telnet service enabled',
      status: 'OPEN',
      session_id: 'demo-session-001'
    },
    {
      id: 2,
      created_at: new Date().toISOString(),
      severity: 'HIGH',
      incident_type: 'Exposed Database',
      source_ip: '192.168.1.150',
      description: 'MySQL database service accessible from network',
      status: 'OPEN',
      session_id: 'demo-session-001'
    }
  ];

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    if (!file.name.endsWith('.xml')) {
      message.error('Please upload only Nmap XML files');
      onError(new Error('Invalid file type'));
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('notes', document.getElementById('upload-notes')?.value || '');

    try {
      const response = await axios.post('http://localhost:8001/api/scan/upload', formData, {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success(`Scan uploaded successfully! Session: ${response.data.session_id}`);
      onSuccess(response.data);
      setUploadModalVisible(false);
      fetchData(); // Refresh data
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Upload failed';
      message.error(errorMsg);
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  const riskDistributionData = [
    { name: 'Low Risk', value: stats.total_hosts - stats.high_risk_hosts, color: '#52c41a' },
    { name: 'High Risk', value: stats.high_risk_hosts, color: '#ff4d4f' }
  ];

  const sessionColumns = [
    {
      title: 'Session ID',
      dataIndex: 'session_id',
      key: 'session_id',
      render: (text) => <code>{text}</code>
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      render: (text) => <><FileTextOutlined /> {text}</>
    },
    {
      title: 'Hosts',
      dataIndex: 'total_hosts',
      key: 'total_hosts',
      render: (count) => <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
    },
    {
      title: 'High Risk Ports',
      dataIndex: 'high_risk_ports',
      key: 'high_risk_ports',
      render: (count) => <Badge count={count} style={{ backgroundColor: count > 0 ? '#ff4d4f' : '#52c41a' }} />
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString()
    }
  ];

  const incidentColumns = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colors = {
          'CRITICAL': '#ff4d4f',
          'HIGH': '#ff7a45',
          'MEDIUM': '#ffa940',
          'LOW': '#52c41a'
        };
        return <Badge color={colors[severity]} text={severity} />;
      }
    },
    {
      title: 'Type',
      dataIndex: 'incident_type',
      key: 'incident_type'
    },
    {
      title: 'Source IP',
      dataIndex: 'source_ip',
      key: 'source_ip',
      render: (ip) => <code>{ip}</code>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'OPEN': 'red',
          'ACKNOWLEDGED': 'orange',
          'RESOLVED': 'green'
        };
        return <Badge color={colors[status]} text={status} />;
      }
    }
  ];

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with Upload Button */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <h1 style={{ margin: 0, color: '#1e293b' }}>
            <SafetyOutlined style={{ marginRight: '10px', color: '#00d4ff' }} />
            CyberHawk Defensive Security Analysis
          </h1>
          <p style={{ margin: '5px 0', color: '#64748b' }}>
            Network Security Analysis Platform - Simulated Dataset Mode
          </p>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
            size="large"
          >
            Upload Nmap Scan
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert
          message="Connection Error"
          description={error + " - Using simulated data for demo"}
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <HistoryOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total_sessions}</div>
                <div style={{ color: '#8c8c8c' }}>Scan Sessions</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <GlobalOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '12px' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total_hosts}</div>
                <div style={{ color: '#8c8c8c' }}>Discovered Hosts</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AlertOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginRight: '12px' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.high_risk_hosts}</div>
                <div style={{ color: '#8c8c8c' }}>High Risk Hosts</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BugOutlined style={{ fontSize: '24px', color: '#fa8c16', marginRight: '12px' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total_incidents}</div>
                <div style={{ color: '#8c8c8c' }}>Security Incidents</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Risk Distribution Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} lg={12}>
          <Card title="Host Risk Distribution" extra={<SecurityScanOutlined />}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" extra={<EyeOutlined />}>
            <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {stats.recent_sessions.length > 0 ? (
                stats.recent_sessions.map((session, index) => (
                  <div key={index} style={{ marginBottom: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>{session.filename}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {session.total_hosts} hosts, {session.high_risk_ports} high-risk ports
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                  No recent scan sessions
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Data Tables */}
      <Tabs defaultActiveKey="sessions">
        <TabPane tab="Scan Sessions" key="sessions">
          <Card title="Scan Session History" extra={<HistoryOutlined />}>
            <Table
              columns={sessionColumns}
              dataSource={scanSessions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </TabPane>
        <TabPane tab="Security Incidents" key="incidents">
          <Card title="Security Incidents" extra={<AlertOutlined />}>
            <Table
              columns={incidentColumns}
              dataSource={incidents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Upload Modal */}
      <Modal
        title="Upload Nmap Scan Results"
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Authorized Scanning Only"
          description="Only upload scan results from networks you own or are authorized to test. CyberHawk performs no live scanning."
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        
        <Form layout="vertical">
          <Form.Item label="Scan Notes (Optional)">
            <TextArea
              id="upload-notes"
              placeholder="Add notes about this scan session..."
              rows={3}
            />
          </Form.Item>
          
          <Form.Item label="Nmap XML File">
            <Upload.Dragger
              name="file"
              customRequest={handleUpload}
              accept=".xml"
              maxCount={1}
              loading={uploading}
            >
              <p className="ant-upload-drag-icon">
                <FileTextOutlined />
              </p>
              <p className="ant-upload-text">Click or drag Nmap XML file to upload</p>
              <p className="ant-upload-hint">
                Only .xml files from Nmap scans are supported (max 10MB)
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;

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
          <Card title="Threat Activity Timeline" loading={loading}>
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
          <Card title="Source Intelligence" loading={loading}>
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
          <Card title="System Health Matrix">
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