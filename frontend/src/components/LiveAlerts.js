import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Badge, Button, Space, Alert, Row, Col } from 'antd';
import { 
  AlertOutlined, 
  ReloadOutlined, 
  ThunderboltOutlined,
  BugOutlined,
  SecurityScanOutlined,
  EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const LiveAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLiveAlerts();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLiveAlerts, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchLiveAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:8001/api/alerts/live', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      });
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Live alerts fetch error:', error);
    } finally {
      setLoading(false);
    }
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

  const getThreatTypeIcon = (threatType) => {
    const type = threatType?.toLowerCase() || '';
    if (type.includes('scan')) return <EyeOutlined style={{ color: '#1890ff' }} />;
    if (type.includes('brute')) return <BugOutlined style={{ color: '#ff4d4f' }} />;
    if (type.includes('anomaly')) return <ThunderboltOutlined style={{ color: '#faad14' }} />;
    return <AlertOutlined style={{ color: '#ff4d4f' }} />;
  };

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return { text: 'High', color: '#ff4d4f' };
    if (confidence >= 0.6) return { text: 'Medium', color: '#faad14' };
    return { text: 'Low', color: '#52c41a' };
  };

  return (
    <div>
      {/* Live Threats Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <AlertOutlined />
            </div>
            <div className="stat-value">{alerts.length}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <BugOutlined />
            </div>
            <div className="stat-value">
              {alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length}
            </div>
            <div className="stat-label">High Priority</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <ThunderboltOutlined />
            </div>
            <div className="stat-value">
              {alerts.filter(a => a.confidence >= 0.8).length}
            </div>
            <div className="stat-label">High Confidence</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <SecurityScanOutlined />
            </div>
            <div className="stat-value">
              {new Set(alerts.map(a => a.source_ip)).size}
            </div>
            <div className="stat-label">Threat Sources</div>
          </div>
        </Col>
      </Row>

      <Card title="🚨 Live Threat Detection">
        <Alert
          message="Real-Time Security Monitoring"
          description="Live threat detection system monitoring your network for suspicious activities. Alerts are automatically classified and prioritized."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchLiveAlerts}
              loading={loading}
            >
              Refresh Threats
            </Button>
            <Button
              type={autoRefresh ? 'primary' : 'default'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
            </Button>
            <Badge 
              count={alerts.length} 
              style={{ backgroundColor: '#ff4d4f' }}
            >
              <span style={{ fontWeight: '600' }}>Live Alerts</span>
            </Badge>
          </Space>
        </div>

        {alerts.length === 0 && !loading && (
          <Alert
            message="🛡️ All Clear"
            description="No security threats detected in the last few minutes. Your network is secure."
            type="success"
            showIcon
          />
        )}

        <List
          loading={loading}
          dataSource={alerts}
          renderItem={(alert, index) => {
            const confidenceLevel = getConfidenceLevel(alert.confidence);
            
            return (
              <List.Item key={index}>
                <Card 
                  size="small" 
                  style={{ width: '100%' }}
                  title={
                    <Space>
                      {getThreatTypeIcon(alert.threat_type)}
                      <span style={{ fontWeight: '600' }}>
                        {alert.threat_type.replace(/_/g, ' ')}
                      </span>
                      <Tag 
                        color={getSeverityColor(alert.severity)}
                        style={{ 
                          color: 'white', 
                          fontWeight: '600',
                          border: 'none'
                        }}
                      >
                        {alert.severity}
                      </Tag>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Tag 
                        color={confidenceLevel.color}
                        style={{ 
                          color: 'white', 
                          fontWeight: '600',
                          border: 'none'
                        }}
                      >
                        {confidenceLevel.text} Confidence
                      </Tag>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </Space>
                  }
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>Source IP:</strong> 
                    <code style={{ 
                      background: 'rgba(255, 77, 79, 0.1)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      color: '#ff4d4f',
                      fontWeight: '600',
                      marginLeft: '8px'
                    }}>
                      {alert.source_ip}
                    </code>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Description:</strong> {alert.description}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Confidence Score:</strong> 
                    <span style={{ 
                      color: confidenceLevel.color, 
                      fontWeight: '600',
                      marginLeft: '8px'
                    }}>
                      {(alert.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {alert.raw_data && (
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ cursor: 'pointer', color: '#1890ff', fontWeight: '600' }}>
                        🔍 Raw Data Analysis
                      </summary>
                      <pre style={{ 
                        background: 'rgba(24, 144, 255, 0.05)', 
                        padding: '12px', 
                        marginTop: '8px',
                        fontSize: '12px',
                        overflow: 'auto',
                        border: '1px solid rgba(24, 144, 255, 0.2)',
                        borderRadius: '4px'
                      }}>
                        {JSON.stringify(alert.raw_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </Card>
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default LiveAlerts;