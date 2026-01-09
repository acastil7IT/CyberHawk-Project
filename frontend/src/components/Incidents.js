import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Button, Space, Modal, Select, message, Card, Row, Col, Alert } from 'antd';
import { 
  ExclamationCircleOutlined, 
  CheckOutlined, 
  SafetyOutlined,
  AlertOutlined,
  BugOutlined,
  SecurityScanOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import mockApi from '../services/mockApi';
import moment from 'moment';

const { Option } = Select;

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: null,
    status: null
  });

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mockApi.getIncidents({
        severity: filters.severity,
        status: filters.status,
        limit: 50
      });
      setIncidents(response);
    } catch (error) {
      message.error('Failed to fetch incidents');
      console.error('Incidents fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.severity, filters.status]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleAcknowledge = async (incidentId) => {
    try {
      await mockApi.acknowledgeIncident(incidentId);
      message.success('Incident acknowledged');
      fetchIncidents();
    } catch (error) {
      message.error('Failed to acknowledge incident');
    }
  };

  const handleResolve = async (incidentId) => {
    Modal.confirm({
      title: 'Resolve Incident',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to resolve this incident?',
      onOk: async () => {
        try {
          await mockApi.resolveIncident(incidentId);
          message.success('Incident resolved');
          fetchIncidents();
        } catch (error) {
          message.error('Failed to resolve incident');
        }
      }
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'LOW': '#52c41a',
      'MEDIUM': '#faad14', 
      'HIGH': '#ff4d4f',
      'CRITICAL': '#722ed1'
    };
    return colors[severity] || '#d9d9d9';
  };

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': '#ff4d4f',
      'ACKNOWLEDGED': '#faad14',
      'RESOLVED': '#52c41a'
    };
    return colors[status] || '#d9d9d9';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag 
          color={getSeverityColor(severity)} 
          style={{ 
            color: 'white', 
            fontWeight: '600',
            border: 'none'
          }}
        >
          {severity}
        </Tag>
      ),
      filters: [
        { text: 'Critical', value: 'CRITICAL' },
        { text: 'High', value: 'HIGH' },
        { text: 'Medium', value: 'MEDIUM' },
        { text: 'Low', value: 'LOW' },
      ],
    },
    {
      title: 'Type',
      dataIndex: 'incident_type',
      key: 'incident_type',
    },
    {
      title: 'Source IP',
      dataIndex: 'source_ip',
      key: 'source_ip',
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={getStatusColor(status)}
          style={{ 
            color: 'white', 
            fontWeight: '600',
            border: 'none'
          }}
        >
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Open', value: 'OPEN' },
        { text: 'Acknowledged', value: 'ACKNOWLEDGED' },
        { text: 'Resolved', value: 'RESOLVED' },
      ],
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'OPEN' && (
            <Button
              size="small"
              type="primary"
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleAcknowledge(record.id)}
            >
              Acknowledge
            </Button>
          )}
          {record.status !== 'RESOLVED' && (
            <Button
              size="small"
              type="primary"
              danger
              icon={<CheckOutlined />}
              onClick={() => handleResolve(record.id)}
            >
              Resolve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Threat Intelligence Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <AlertOutlined />
            </div>
            <div className="stat-value">
              {incidents.filter(i => i.status === 'OPEN').length}
            </div>
            <div className="stat-label">Active Threats</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <BugOutlined />
            </div>
            <div className="stat-value">
              {incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length}
            </div>
            <div className="stat-label">Critical/High</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <SecurityScanOutlined />
            </div>
            <div className="stat-value">
              {incidents.filter(i => i.status === 'ACKNOWLEDGED').length}
            </div>
            <div className="stat-label">Under Investigation</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <SafetyOutlined />
            </div>
            <div className="stat-value">
              {incidents.filter(i => i.status === 'RESOLVED').length}
            </div>
            <div className="stat-label">Resolved</div>
          </div>
        </Col>
      </Row>

      <Card title="🎯 Threat Intelligence Dashboard">
        <Alert
          message="Security Operations Center"
          description="Monitor and respond to security incidents across your network infrastructure. All incidents are automatically classified and prioritized."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Select
              placeholder="Filter by Severity"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, severity: value })}
            >
              <Option value="CRITICAL">Critical</Option>
              <Option value="HIGH">High</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LOW">Low</Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="OPEN">Open</Option>
              <Option value="ACKNOWLEDGED">Acknowledged</Option>
              <Option value="RESOLVED">Resolved</Option>
            </Select>
            <Button onClick={fetchIncidents} icon={<ReloadOutlined />}>
              Refresh Intelligence
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={incidents}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default Incidents;