import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tag, Card, Row, Col, Alert } from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  GlobalOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const NetworkTraffic = () => {
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchIP, setSearchIP] = useState('');

  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTraffic = async (sourceIP = null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sourceIP) params.append('source_ip', sourceIP);
      params.append('limit', '200');

      const response = await axios.get(`http://localhost:8001/api/traffic?${params}`, {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });
      setTraffic(response.data);
    } catch (error) {
      console.error('Traffic fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTraffic(searchIP || null);
  };

  const getProtocolColor = (protocol) => {
    const colors = {
      'TCP': '#1890ff',
      'UDP': '#52c41a', 
      'ICMP': '#faad14',
      'OTHER': '#d9d9d9'
    };
    return colors[protocol] || '#d9d9d9';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => moment(date).format('HH:mm:ss'),
      width: 100,
    },
    {
      title: 'Source IP',
      dataIndex: 'source_ip',
      key: 'source_ip',
      width: 120,
      render: (ip) => (
        <code style={{ 
          background: 'rgba(24, 144, 255, 0.1)', 
          padding: '2px 6px', 
          borderRadius: '4px',
          color: '#1890ff',
          fontWeight: '600'
        }}>
          {ip}
        </code>
      )
    },
    {
      title: 'Source Port',
      dataIndex: 'source_port',
      key: 'source_port',
      width: 100,
    },
    {
      title: 'Destination IP',
      dataIndex: 'dest_ip',
      key: 'dest_ip',
      width: 120,
      render: (ip) => (
        <code style={{ 
          background: 'rgba(82, 196, 26, 0.1)', 
          padding: '2px 6px', 
          borderRadius: '4px',
          color: '#52c41a',
          fontWeight: '600'
        }}>
          {ip}
        </code>
      )
    },
    {
      title: 'Dest Port',
      dataIndex: 'dest_port',
      key: 'dest_port',
      width: 100,
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      render: (protocol) => (
        <Tag 
          color={getProtocolColor(protocol)}
          style={{ 
            color: 'white', 
            fontWeight: '600',
            border: 'none'
          }}
        >
          {protocol}
        </Tag>
      ),
      width: 80,
    },
    {
      title: 'Size',
      dataIndex: 'packet_size',
      key: 'packet_size',
      render: (size) => formatBytes(size),
      sorter: (a, b) => a.packet_size - b.packet_size,
      width: 80,
    },
  ];

  return (
    <div>
      {/* Network Monitoring Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <GlobalOutlined />
            </div>
            <div className="stat-value">{traffic.length}</div>
            <div className="stat-label">Live Packets</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <ThunderboltOutlined />
            </div>
            <div className="stat-value">
              {traffic.filter(t => t.protocol === 'TCP').length}
            </div>
            <div className="stat-label">TCP Connections</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <CloudServerOutlined />
            </div>
            <div className="stat-value">
              {traffic.filter(t => t.protocol === 'UDP').length}
            </div>
            <div className="stat-label">UDP Packets</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <SecurityScanOutlined />
            </div>
            <div className="stat-value">
              {new Set(traffic.map(t => t.source_ip)).size}
            </div>
            <div className="stat-label">Unique Sources</div>
          </div>
        </Col>
      </Row>

      <Card title="📡 Network Traffic Monitor">
        <Alert
          message="Real-Time Network Analysis"
          description="Monitor live network traffic across your infrastructure. Traffic is automatically captured and analyzed for security patterns."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="Search by Source IP"
              value={searchIP}
              onChange={(e) => setSearchIP(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
            />
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Search Traffic
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchIP('');
                fetchTraffic();
              }}
            >
              Clear & Refresh
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={traffic}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} packets`,
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default NetworkTraffic;