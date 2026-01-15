import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Upload, Modal, Form, Input, message, Alert, Badge, Tabs, Descriptions } from 'antd';
import { 
  UploadOutlined, 
  FileTextOutlined, 
  SecurityScanOutlined,
  EyeOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;
const { TextArea } = Input;

const ScanUpload = () => {
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scanSessions, setScanSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionHosts, setSessionHosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScanSessions();
  }, []);

  const fetchScanSessions = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/scan/sessions', {
        headers: { 'Authorization': 'Bearer demo-token' }
      });
      setScanSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch scan sessions:', error);
      // Use mock data for demo
      setScanSessions([
        {
          id: 1,
          session_id: 'demo-session-001',
          created_at: new Date().toISOString(),
          filename: 'network_scan_demo.xml',
          total_hosts: 5,
          total_open_ports: 23,
          high_risk_ports: 8,
          scan_command: 'nmap -sS -sV -O 192.168.1.0/24',
          notes: 'Demo scan session for portfolio showcase - simulated data only'
        }
      ]);
    }
  };

  const fetchSessionHosts = async (sessionId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8001/api/scan/sessions/${sessionId}/hosts`, {
        headers: { 'Authorization': 'Bearer demo-token' }
      });
      setSessionHosts(response.data.hosts || []);
    } catch (error) {
      console.error('Failed to fetch session hosts:', error);
      // Use mock data for demo
      setSessionHosts([
        {
          id: 1,
          ip_address: '192.168.1.1',
          hostname: 'router.local',
          vendor: 'Netgear Inc.',
          os_name: 'Linux 3.x',
          risk_score: 6,
          risk_level: 'MEDIUM',
          port_count: 4,
          high_risk_port_count: 1,
          ports: [
            { port_number: 22, protocol: 'tcp', service_name: 'ssh', service_version: 'OpenSSH 7.4', is_high_risk: true },
            { port_number: 53, protocol: 'udp', service_name: 'domain', service_version: 'dnsmasq 2.76', is_high_risk: false },
            { port_number: 80, protocol: 'tcp', service_name: 'http', service_version: 'nginx 1.14.0', is_high_risk: false },
            { port_number: 443, protocol: 'tcp', service_name: 'https', service_version: 'nginx 1.14.0', is_high_risk: false }
          ]
        },
        {
          id: 2,
          ip_address: '192.168.1.75',
          hostname: 'iot-camera',
          vendor: 'Hikvision',
          os_name: 'Embedded Linux',
          risk_score: 9,
          risk_level: 'CRITICAL',
          port_count: 4,
          high_risk_port_count: 2,
          ports: [
            { port_number: 23, protocol: 'tcp', service_name: 'telnet', service_version: 'Linux telnetd', is_high_risk: true },
            { port_number: 80, protocol: 'tcp', service_name: 'http', service_version: 'Hikvision Webserver', is_high_risk: false },
            { port_number: 554, protocol: 'tcp', service_name: 'rtsp', service_version: 'RTSP/1.0', is_high_risk: false },
            { port_number: 8000, protocol: 'tcp', service_name: 'http-alt', service_version: 'Hikvision IP Camera', is_high_risk: true }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
      fetchScanSessions(); // Refresh sessions list
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Upload failed';
      message.error(errorMsg);
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  const sessionColumns = [
    {
      title: 'Session ID',
      dataIndex: 'session_id',
      key: 'session_id',
      render: (text) => (
        <code style={{ 
          fontSize: '12px',
          background: '#f8fafc',
          padding: '4px 8px',
          borderRadius: '4px',
          color: '#1e293b'
        }}>
          {text}
        </code>
      )
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      render: (text) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileTextOutlined style={{ color: '#0ea5e9' }} /> 
          <span style={{ fontWeight: '500' }}>{text}</span>
        </span>
      )
    },
    {
      title: 'Hosts',
      dataIndex: 'total_hosts',
      key: 'total_hosts',
      render: (count) => (
        <Badge 
          count={count} 
          style={{ 
            backgroundColor: '#0ea5e9',
            fontWeight: '600',
            fontSize: '13px'
          }} 
        />
      )
    },
    {
      title: 'Open Ports',
      dataIndex: 'total_open_ports',
      key: 'total_open_ports',
      render: (count) => (
        <Badge 
          count={count} 
          style={{ 
            backgroundColor: '#10b981',
            fontWeight: '600',
            fontSize: '13px'
          }} 
        />
      )
    },
    {
      title: 'High Risk',
      dataIndex: 'high_risk_ports',
      key: 'high_risk_ports',
      render: (count) => (
        <Badge 
          count={count} 
          style={{ 
            backgroundColor: count > 0 ? '#ef4444' : '#10b981',
            fontWeight: '600',
            fontSize: '13px'
          }} 
        />
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span style={{ color: '#64748b', fontSize: '13px' }}>
          {new Date(date).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedSession(record);
            fetchSessionHosts(record.session_id);
          }}
          style={{
            fontWeight: '500',
            color: '#0ea5e9'
          }}
        >
          View Details
        </Button>
      )
    }
  ];

  const hostColumns = [
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip) => (
        <code style={{ 
          background: '#f8fafc',
          padding: '4px 8px',
          borderRadius: '4px',
          color: '#1e293b',
          fontWeight: '600',
          fontSize: '13px'
        }}>
          {ip}
        </code>
      )
    },
    {
      title: 'Hostname',
      dataIndex: 'hostname',
      key: 'hostname',
      render: (hostname) => hostname ? (
        <span style={{ fontWeight: '500', color: '#1e293b' }}>{hostname}</span>
      ) : (
        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unknown</span>
      )
    },
    {
      title: 'OS',
      dataIndex: 'os_name',
      key: 'os_name',
      render: (os) => os ? (
        <span style={{ color: '#64748b' }}>{os}</span>
      ) : (
        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unknown</span>
      )
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (level, record) => {
        const colors = {
          'CRITICAL': '#ef4444',
          'HIGH': '#f59e0b',
          'MEDIUM': '#fbbf24',
          'LOW': '#10b981'
        };
        return (
          <Badge 
            color={colors[level]} 
            text={
              <span style={{ fontWeight: '600' }}>
                {level} ({record.risk_score}/10)
              </span>
            }
          />
        );
      }
    },
    {
      title: 'Open Ports',
      dataIndex: 'port_count',
      key: 'port_count',
      render: (count, record) => (
        <span style={{ fontSize: '14px' }}>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>{count}</span>
          <span style={{ color: '#64748b' }}> total</span>
          {record.high_risk_port_count > 0 && (
            <span style={{ 
              color: '#ef4444', 
              marginLeft: '8px',
              fontWeight: '600'
            }}>
              ({record.high_risk_port_count} high-risk)
            </span>
          )}
        </span>
      )
    }
  ];

  const expandedRowRender = (record) => {
    const portColumns = [
      {
        title: 'Port',
        dataIndex: 'port_number',
        key: 'port_number',
        render: (port, portRecord) => (
          <span>
            {port}/{portRecord.protocol}
            {portRecord.is_high_risk && (
              <WarningOutlined style={{ color: '#ff4d4f', marginLeft: '4px' }} />
            )}
          </span>
        )
      },
      {
        title: 'Service',
        dataIndex: 'service_name',
        key: 'service_name'
      },
      {
        title: 'Version',
        dataIndex: 'service_version',
        key: 'service_version',
        render: (version) => version || <span style={{ color: '#ccc' }}>Unknown</span>
      },
      {
        title: 'Risk',
        dataIndex: 'is_high_risk',
        key: 'is_high_risk',
        render: (isHighRisk) => (
          isHighRisk ? 
            <Badge color="red" text="High Risk" /> : 
            <Badge color="green" text="Low Risk" />
        )
      }
    ];

    return (
      <Table
        columns={portColumns}
        dataSource={record.ports}
        pagination={false}
        size="small"
        rowKey="port_number"
      />
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
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
            <SecurityScanOutlined style={{ marginRight: '12px', color: '#0ea5e9' }} />
            Scan Upload & Analysis
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#64748b',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Upload and analyze Nmap XML scan results from authorized network scans
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
            Upload New Scan
          </Button>
        </Col>
      </Row>

      <Alert
        message="Authorized Scanning Only"
        description="This platform analyzes scan results from networks you own or are authorized to test. CyberHawk performs no live scanning and operates in defensive analysis mode only."
        type="info"
        showIcon
        style={{ 
          marginBottom: '24px',
          borderRadius: '12px',
          border: '1px solid #0ea5e9'
        }}
      />

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
            title={
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                <HistoryOutlined style={{ marginRight: '8px', color: '#0ea5e9' }} />
                Scan Session History
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

        {selectedSession && (
          <TabPane 
            tab={
              <span style={{ fontSize: '15px', fontWeight: '500', padding: '8px 16px' }}>
                <InfoCircleOutlined style={{ marginRight: '8px' }} />
                Session Details
              </span>
            } 
            key="details"
          >
            <Card 
              title={
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                  <InfoCircleOutlined style={{ marginRight: '8px', color: '#0ea5e9' }} />
                  Session Details: {selectedSession.session_id}
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
              <Descriptions 
                bordered 
                column={2} 
                style={{ 
                  marginBottom: '24px',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <Descriptions.Item label="Filename">{selectedSession.filename}</Descriptions.Item>
                <Descriptions.Item label="Created">{new Date(selectedSession.created_at).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Total Hosts">{selectedSession.total_hosts}</Descriptions.Item>
                <Descriptions.Item label="Open Ports">{selectedSession.total_open_ports}</Descriptions.Item>
                <Descriptions.Item label="High Risk Ports">{selectedSession.high_risk_ports}</Descriptions.Item>
                <Descriptions.Item label="Scan Command" span={2}>
                  <code style={{ 
                    background: '#f8fafc', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}>
                    {selectedSession.scan_command}
                  </code>
                </Descriptions.Item>
                {selectedSession.notes && (
                  <Descriptions.Item label="Notes" span={2}>{selectedSession.notes}</Descriptions.Item>
                )}
              </Descriptions>

              <Table
                columns={hostColumns}
                dataSource={sessionHosts}
                rowKey="id"
                loading={loading}
                expandable={{
                  expandedRowRender,
                  rowExpandable: (record) => record.ports && record.ports.length > 0,
                }}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="middle"
                style={{ borderRadius: '8px', overflow: 'hidden' }}
              />
            </Card>
          </TabPane>
        )}
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
          message="Security Notice"
          description="Only upload scan results from networks you own or are authorized to test. Ensure compliance with all applicable laws and regulations."
          type="warning"
          showIcon
          style={{ 
            marginBottom: '24px',
            borderRadius: '8px'
          }}
        />
        
        <Form layout="vertical">
          <Form.Item label="Scan Notes (Optional)">
            <TextArea
              id="upload-notes"
              placeholder="Add notes about this scan session (e.g., scan purpose, network details, findings summary)..."
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

        <Alert
          message="Supported Nmap Commands"
          description={
            <div>
              <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>Examples of Nmap commands that generate compatible XML output:</p>
              <ul style={{ marginBottom: 0, lineHeight: '1.8' }}>
                <li>
                  <code style={{ 
                    background: '#f8fafc', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    nmap -sS -sV -O -oX scan.xml 192.168.1.0/24
                  </code>
                </li>
                <li>
                  <code style={{ 
                    background: '#f8fafc', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    nmap -sT -sV -p- -oX scan.xml target.com
                  </code>
                </li>
                <li>
                  <code style={{ 
                    background: '#f8fafc', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    nmap -sU -sV --top-ports 1000 -oX scan.xml 10.0.0.0/8
                  </code>
                </li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ 
            marginTop: '24px',
            borderRadius: '8px'
          }}
        />
      </Modal>
    </div>
  );
};

export default ScanUpload;