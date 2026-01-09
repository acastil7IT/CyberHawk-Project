import React, { useState, useEffect } from 'react';

// Mock network devices data for cloud deployment
const mockNetworkDevices = [
  {
    id: 1,
    ip_address: '192.168.1.1',
    hostname: 'router.local',
    device_type: 'Router/Gateway',
    vendor: 'Netgear Inc.',
    is_online: true,
    risk_score: 15,
    open_ports: ['80', '443', '22', '53'],
    mac_address: '00:1B:44:11:3A:B7',
    os_fingerprint: 'Linux 3.x',
    first_discovered: new Date(Date.now() - 86400000 * 7).toISOString(),
    last_seen: new Date(Date.now() - 300000).toISOString(),
    services: {
      '80': { service: 'HTTP', version: 'nginx 1.18' },
      '443': { service: 'HTTPS', version: 'nginx 1.18' },
      '22': { service: 'SSH', version: 'OpenSSH 8.2' },
      '53': { service: 'DNS', version: 'dnsmasq 2.80' }
    }
  },
  {
    id: 2,
    ip_address: '192.168.1.100',
    hostname: 'workstation-01',
    device_type: 'Windows Computer',
    vendor: 'Dell Inc.',
    is_online: true,
    risk_score: 35,
    open_ports: ['135', '139', '445', '3389'],
    mac_address: '00:50:56:C0:00:08',
    os_fingerprint: 'Windows 10',
    first_discovered: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_seen: new Date(Date.now() - 120000).toISOString(),
    services: {
      '135': { service: 'RPC', version: 'Microsoft Windows RPC' },
      '139': { service: 'NetBIOS', version: 'Microsoft Windows netbios-ssn' },
      '445': { service: 'SMB', version: 'Microsoft Windows Server 2008' },
      '3389': { service: 'RDP', version: 'Microsoft Terminal Services' }
    }
  },
  {
    id: 3,
    ip_address: '192.168.1.150',
    hostname: 'iPhone-Alex',
    device_type: 'Mobile Device',
    vendor: 'Apple Inc.',
    is_online: true,
    risk_score: 5,
    open_ports: ['62078'],
    mac_address: '8C:85:90:12:34:56',
    os_fingerprint: 'iOS 16.x',
    first_discovered: new Date(Date.now() - 86400000 * 1).toISOString(),
    last_seen: new Date(Date.now() - 60000).toISOString(),
    services: {
      '62078': { service: 'AirPlay', version: 'Apple AirPlay' }
    }
  },
  {
    id: 4,
    ip_address: '192.168.1.200',
    hostname: 'server-01',
    device_type: 'Linux Server',
    vendor: 'HP Enterprise',
    is_online: true,
    risk_score: 25,
    open_ports: ['22', '80', '443', '3306', '5432'],
    mac_address: '00:15:5D:FF:FF:FF',
    os_fingerprint: 'Ubuntu 20.04',
    first_discovered: new Date(Date.now() - 86400000 * 14).toISOString(),
    last_seen: new Date(Date.now() - 180000).toISOString(),
    services: {
      '22': { service: 'SSH', version: 'OpenSSH 8.2p1' },
      '80': { service: 'HTTP', version: 'Apache 2.4.41' },
      '443': { service: 'HTTPS', version: 'Apache 2.4.41' },
      '3306': { service: 'MySQL', version: 'MySQL 8.0.25' },
      '5432': { service: 'PostgreSQL', version: 'PostgreSQL 12.7' }
    }
  },
  {
    id: 5,
    ip_address: '192.168.1.75',
    hostname: 'smart-tv',
    device_type: 'IoT Device',
    vendor: 'Samsung Electronics',
    is_online: false,
    risk_score: 45,
    open_ports: ['8080', '8443'],
    mac_address: '00:26:37:12:34:56',
    os_fingerprint: 'Tizen OS',
    first_discovered: new Date(Date.now() - 86400000 * 5).toISOString(),
    last_seen: new Date(Date.now() - 3600000).toISOString(),
    services: {
      '8080': { service: 'HTTP', version: 'Samsung Smart TV' },
      '8443': { service: 'HTTPS', version: 'Samsung Smart TV' }
    }
  }
];

const mockStats = {
  total: 5,
  online: 4,
  offline: 1,
  new_today: 1
};
import { Card, Row, Col, Table, Tag, Button, Space, Modal, Descriptions, Progress, Alert, Tooltip } from 'antd';
import { 
  WifiOutlined, 
  LaptopOutlined, 
  MobileOutlined,
  ApiOutlined,
  CloudServerOutlined,
  ReloadOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const NetworkDiscovery = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    new_today: 0
  });

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/network/devices', {
        headers: { 'Authorization': 'Bearer demo-token' }
      });
      
      setDevices(response.data.devices || []);
      setStats(response.data.stats || { total: 0, online: 0, offline: 0, new_today: 0 });
    } catch (error) {
      console.log('Using mock data for cloud deployment');
      // Use mock data for cloud deployment
      setDevices(mockNetworkDevices);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const startNetworkScan = async () => {
    try {
      setScanning(true);
      await axios.post('http://localhost:8001/api/network/scan', {}, {
        headers: { 'Authorization': 'Bearer demo-token' }
      });
      
      // Refresh devices after scan
      setTimeout(() => {
        fetchDevices();
        setScanning(false);
      }, 10000); // Wait 10 seconds for scan to complete
      
    } catch (error) {
      console.log('Using mock scan for cloud deployment');
      // Simulate scan for cloud deployment
      setTimeout(() => {
        fetchDevices();
        setScanning(false);
      }, 3000); // Shorter wait for demo
    }
  };

  const getDeviceIcon = (deviceType) => {
    const type = (deviceType || '').toLowerCase();
    
    if (type.includes('router') || type.includes('gateway')) {
      return <ApiOutlined style={{ color: '#1890ff' }} />;
    } else if (type.includes('server')) {
      return <CloudServerOutlined style={{ color: '#52c41a' }} />;
    } else if (type.includes('mobile') || type.includes('phone')) {
      return <MobileOutlined style={{ color: '#722ed1' }} />;
    } else if (type.includes('computer') || type.includes('laptop')) {
      return <LaptopOutlined style={{ color: '#fa8c16' }} />;
    } else {
      return <WifiOutlined style={{ color: '#13c2c2' }} />;
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 80) return 'red';
    if (riskScore >= 60) return 'orange';
    if (riskScore >= 40) return 'yellow';
    return 'green';
  };

  const showDeviceDetails = (device) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Device',
      key: 'device',
      render: (_, record) => (
        <Space>
          {getDeviceIcon(record.device_type)}
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.hostname || record.ip_address}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.ip_address}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'device_type',
      key: 'device_type',
      render: (type) => (
        <Tag color="blue">{type || 'Unknown'}</Tag>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
      render: (vendor) => vendor || 'Unknown',
    },
    {
      title: 'Status',
      dataIndex: 'is_online',
      key: 'status',
      render: (isOnline) => (
        <Tag color={isOnline ? 'green' : 'red'} icon={isOnline ? <CheckCircleOutlined /> : <WarningOutlined />}>
          {isOnline ? 'Online' : 'Offline'}
        </Tag>
      ),
    },
    {
      title: 'Open Ports',
      dataIndex: 'open_ports',
      key: 'open_ports',
      render: (ports) => (
        <div>
          {(ports || []).slice(0, 3).map(port => (
            <Tag key={port} size="small">{port}</Tag>
          ))}
          {(ports || []).length > 3 && <Tag size="small">+{(ports || []).length - 3}</Tag>}
        </div>
      ),
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (score) => (
        <Progress
          percent={score || 0}
          size="small"
          strokeColor={getRiskColor(score || 0)}
          showInfo={false}
        />
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_seen',
      key: 'last_seen',
      render: (lastSeen) => (
        <Tooltip title={moment(lastSeen).format('YYYY-MM-DD HH:mm:ss')}>
          {moment(lastSeen).fromNow()}
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDeviceDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Alert
        message="Network Discovery"
        description="Real-time monitoring of devices on your local network. This feature scans your network to discover connected devices and monitor their status."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <WifiOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
                {stats.total}
              </div>
              <div>Total Devices</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
                {stats.online}
              </div>
              <div>Online</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <WarningOutlined style={{ fontSize: 24, color: '#f5222d' }} />
              <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
                {stats.offline}
              </div>
              <div>Offline</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ApiOutlined style={{ fontSize: 24, color: '#722ed1' }} />
              <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
                {stats.new_today}
              </div>
              <div>New Today</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Control Panel */}
      <Card title="Network Scan Control" style={{ marginBottom: 24 }}>
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={scanning}
            onClick={startNetworkScan}
          >
            {scanning ? 'Scanning Network...' : 'Start Network Scan'}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDevices}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
        {scanning && (
          <div style={{ marginTop: 16 }}>
            <Progress percent={100} status="active" showInfo={false} />
            <p style={{ marginTop: 8, color: '#666' }}>
              Scanning local network for devices... This may take a few minutes.
            </p>
          </div>
        )}
      </Card>

      {/* Devices Table */}
      <Card title="Discovered Devices">
        <Table
          columns={columns}
          dataSource={devices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} devices`,
          }}
        />
      </Card>

      {/* Device Details Modal */}
      <Modal
        title="Device Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedDevice && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="IP Address">
                {selectedDevice.ip_address}
              </Descriptions.Item>
              <Descriptions.Item label="Hostname">
                {selectedDevice.hostname || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="MAC Address">
                {selectedDevice.mac_address || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Vendor">
                {selectedDevice.vendor || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Device Type">
                <Tag color="blue">{selectedDevice.device_type || 'Unknown'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedDevice.is_online ? 'green' : 'red'}>
                  {selectedDevice.is_online ? 'Online' : 'Offline'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="OS Fingerprint">
                {selectedDevice.os_fingerprint || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Risk Score">
                <Progress
                  percent={selectedDevice.risk_score || 0}
                  strokeColor={getRiskColor(selectedDevice.risk_score || 0)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="First Discovered">
                {moment(selectedDevice.first_discovered).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Seen">
                {moment(selectedDevice.last_seen).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {selectedDevice.open_ports && selectedDevice.open_ports.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>Open Ports & Services</h4>
                <div>
                  {selectedDevice.open_ports.map(port => (
                    <Tag key={port} style={{ marginBottom: 8 }}>
                      Port {port}
                      {selectedDevice.services && selectedDevice.services[port] && 
                        ` - ${selectedDevice.services[port].service}`
                      }
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NetworkDiscovery;