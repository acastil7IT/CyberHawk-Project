import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Badge, Button, Upload, Modal, Form, Input, message, Tabs } from 'antd';
import { 
  AlertOutlined, 
  GlobalOutlined, 
  SecurityScanOutlined,
  SafetyOutlined,
  EyeOutlined,
  BugOutlined,
  UploadOutlined,
  FileTextOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header with Upload Button */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '32px' }}>
        <Col>
          <h1 style={{ 
            margin: 0, 
            color: '#1e293b', 
            fontSize: '32px', 
            fontWeight: '700',
            letterSpacing: '-0.5px',
            lineHeight: '1.2'
          }}>
            <SafetyOutlined style={{ marginRight: '12px', color: '#0ea5e9' }} />
            CyberHawk Defensive Security Analysis
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#64748b',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Network Security Analysis Platform • Simulated Dataset Mode
          </p>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
            size="large"
            style={{
              height: '48px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
            }}
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
          style={{ 
            marginBottom: '24px',
            borderRadius: '12px',
            border: '1px solid #fbbf24'
          }}
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#ffffff'
              }}>
                <HistoryOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: '#1e293b',
                  lineHeight: '1',
                  marginBottom: '6px'
                }}>
                  {stats.total_sessions}
                </div>
                <div style={{ 
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Scan Sessions
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#ffffff'
              }}>
                <GlobalOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: '#1e293b',
                  lineHeight: '1',
                  marginBottom: '6px'
                }}>
                  {stats.total_hosts}
                </div>
                <div style={{ 
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Discovered Hosts
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#ffffff'
              }}>
                <AlertOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: '#1e293b',
                  lineHeight: '1',
                  marginBottom: '6px'
                }}>
                  {stats.high_risk_hosts}
                </div>
                <div style={{ 
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  High Risk Hosts
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#ffffff'
              }}>
                <BugOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: '#1e293b',
                  lineHeight: '1',
                  marginBottom: '6px'
                }}>
                  {stats.total_incidents}
                </div>
                <div style={{ 
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Security Incidents
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Risk Distribution Chart */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                <SecurityScanOutlined style={{ marginRight: '8px', color: '#0ea5e9' }} />
                Host Risk Distribution
              </span>
            }
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
            headStyle={{
              borderBottom: '1px solid #e2e8f0',
              padding: '20px 24px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
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
          <Card 
            title={
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                <EyeOutlined style={{ marginRight: '8px', color: '#0ea5e9' }} />
                Recent Activity
              </span>
            }
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
            headStyle={{
              borderBottom: '1px solid #e2e8f0',
              padding: '20px 24px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ minHeight: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
              {stats.recent_sessions.length > 0 ? (
                stats.recent_sessions.map((session, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '16px', 
                      background: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ 
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '6px',
                      fontSize: '15px'
                    }}>
                      {session.filename}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#64748b',
                      lineHeight: '1.5'
                    }}>
                      {session.total_hosts} hosts discovered • {session.high_risk_ports} high-risk ports detected
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                  <HistoryOutlined style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '15px' }}>No recent scan sessions</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Data Tables */}
      <Tabs 
        defaultActiveKey="sessions"
        style={{ marginBottom: '24px' }}
        tabBarStyle={{
          marginBottom: '24px',
          borderBottom: '2px solid #e2e8f0'
        }}
      >
        <TabPane 
          tab={
            <span style={{ fontSize: '15px', fontWeight: '500', padding: '8px 16px' }}>
              <HistoryOutlined style={{ marginRight: '8px' }} />
              Scan Sessions
            </span>
          } 
          key="sessions"
        >
          <Card 
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
            bodyStyle={{ padding: '0' }}
          >
            <Table
              columns={sessionColumns}
              dataSource={scanSessions}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="middle"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            />
          </Card>
        </TabPane>
        <TabPane 
          tab={
            <span style={{ fontSize: '15px', fontWeight: '500', padding: '8px 16px' }}>
              <AlertOutlined style={{ marginRight: '8px' }} />
              Security Incidents
            </span>
          } 
          key="incidents"
        >
          <Card 
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
            bodyStyle={{ padding: '0' }}
          >
            <Table
              columns={incidentColumns}
              dataSource={incidents}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="middle"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Upload Modal */}
      <Modal
        title={
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
            <UploadOutlined style={{ marginRight: '8px', color: '#0ea5e9' }} />
            Upload Nmap Scan Results
          </span>
        }
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
        bodyStyle={{ padding: '24px' }}
      >
        <Alert
          message="Authorized Scanning Only"
          description="Only upload scan results from networks you own or are authorized to test. CyberHawk performs no live scanning."
          type="info"
          showIcon
          style={{ 
            marginBottom: '24px',
            borderRadius: '8px',
            border: '1px solid #0ea5e9'
          }}
        />
        
        <Form layout="vertical">
          <Form.Item 
            label={
              <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                Scan Notes (Optional)
              </span>
            }
          >
            <TextArea
              id="upload-notes"
              placeholder="Add notes about this scan session..."
              rows={3}
              style={{
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </Form.Item>
          
          <Form.Item 
            label={
              <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                Nmap XML File
              </span>
            }
          >
            <Upload.Dragger
              name="file"
              customRequest={handleUpload}
              accept=".xml"
              maxCount={1}
              loading={uploading}
              style={{
                borderRadius: '8px',
                border: '2px dashed #cbd5e1'
              }}
            >
              <p className="ant-upload-drag-icon">
                <FileTextOutlined style={{ color: '#0ea5e9', fontSize: '48px' }} />
              </p>
              <p className="ant-upload-text" style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px'
              }}>
                Click or drag Nmap XML file to upload
              </p>
              <p className="ant-upload-hint" style={{ 
                fontSize: '14px',
                color: '#64748b'
              }}>
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