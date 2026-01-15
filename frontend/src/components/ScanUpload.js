import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Upload, Modal, Form, Input, message, Alert, Badge, Tabs, Descriptions } from 'antd';
import { 
  UploadOutlined, 
  FileTextOutlined, 
  SecurityScanOutlined,
  EyeOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined
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
      render: (text) => <code style={{ fontSize: '12px' }}>{text}</code>
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
      title: 'Open Ports',
      dataIndex: 'total_open_ports',
      key: 'total_open_ports',
      render: (count) => <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
    },
    {
      title: 'High Risk',
      dataIndex: 'high_risk_ports',
      key: 'high_risk_ports',
      render: (count) => <Badge count={count} style={{ backgroundColor: count > 0 ? '#ff4d4f' : '#52c41a' }} />
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString()
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
      render: (ip) => <code>{ip}</code>
    },
    {
      title: 'Hostname',
      dataIndex: 'hostname',
      key: 'hostname',
      render: (hostname) => hostname || <span style={{ color: '#ccc' }}>Unknown</span>
    },
    {
      title: 'OS',
      dataIndex: 'os_name',
      key: 'os_name',
      render: (os) => os || <span style={{ color: '#ccc' }}>Unknown</span>
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (level, record) => {
        const colors = {
          'CRITICAL': '#ff4d4f',
          'HIGH': '#ff7a45',
          'MEDIUM': '#ffa940',
          'LOW': '#52c41a'
        };
        return (
          <Badge 
            color={colors[level]} 
            text={`${level} (${record.risk_score}/10)`} 
          />
        );
      }
    },
    {
      title: 'Open Ports',
      dataIndex: 'port_count',
      key: 'port_count',
      render: (count, record) => (
        <span>
          {count} total 
          {record.high_risk_port_count > 0 && (
            <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>
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
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <h1 style={{ margin: 0, color: '#1e293b' }}>
            <SecurityScanOutlined style={{ marginRight: '10px', color: '#00d4ff' }} />
            Scan Upload & Analysis
          </h1>
          <p style={{ margin: '5px 0', color: '#64748b' }}>
            Upload and analyze Nmap XML scan results from authorized network scans
          </p>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
            size="large"
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
        style={{ marginBottom: '20px' }}
      />

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

        {selectedSession && (
          <TabPane tab="Session Details" key="details">
            <Card title={`Session Details: ${selectedSession.session_id}`} extra={<InfoCircleOutlined />}>
              <Descriptions bordered column={2} style={{ marginBottom: '20px' }}>
                <Descriptions.Item label="Filename">{selectedSession.filename}</Descriptions.Item>
                <Descriptions.Item label="Created">{new Date(selectedSession.created_at).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Total Hosts">{selectedSession.total_hosts}</Descriptions.Item>
                <Descriptions.Item label="Open Ports">{selectedSession.total_open_ports}</Descriptions.Item>
                <Descriptions.Item label="High Risk Ports">{selectedSession.high_risk_ports}</Descriptions.Item>
                <Descriptions.Item label="Scan Command" span={2}>
                  <code>{selectedSession.scan_command}</code>
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
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </Card>
          </TabPane>
        )}
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
          message="Security Notice"
          description="Only upload scan results from networks you own or are authorized to test. Ensure compliance with all applicable laws and regulations."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
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
              <p>Examples of Nmap commands that generate compatible XML output:</p>
              <ul style={{ marginBottom: 0 }}>
                <li><code>nmap -sS -sV -O -oX scan.xml 192.168.1.0/24</code></li>
                <li><code>nmap -sT -sV -p- -oX scan.xml target.com</code></li>
                <li><code>nmap -sU -sV --top-ports 1000 -oX scan.xml 10.0.0.0/8</code></li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: '20px' }}
        />
      </Modal>
    </div>
  );
};

export default ScanUpload;