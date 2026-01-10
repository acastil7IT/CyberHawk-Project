import React, { useState, useEffect } from 'react';
import { List, Tag, Badge, Button, Space } from 'antd';
import { 
  AlertOutlined, 
  ReloadOutlined, 
  ThunderboltOutlined,
  BugOutlined,
  SecurityScanOutlined,
  EyeOutlined
} from '@ant-design/icons';
import mockApi from '../services/mockApi';
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
      setLoading(true);
      
      // Always use mock data for now since API is not running
      const mockData = await mockApi.getLiveAlerts();
      setAlerts(mockData.alerts || []);
      
    } catch (error) {
      console.error('Live alerts fetch error:', error);
      // Set empty array to prevent loading forever
      setAlerts([]);
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
    <div className="cyberhawk-content">
      <div className="page-header">
        <h1>Cyber Arsenal</h1>
        <p>Live threat detection system monitoring your network for suspicious activities. Alerts are automatically classified and prioritized.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon critical">
            <AlertOutlined />
          </div>
          <div className="stat-content">
            <div className="stat-number">{alerts.length}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <BugOutlined />
          </div>
          <div className="stat-content">
            <div className="stat-number">{alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon info">
            <ThunderboltOutlined />
          </div>
          <div className="stat-content">
            <div className="stat-number">{alerts.filter(a => a.confidence >= 0.8).length}</div>
            <div className="stat-label">High Confidence</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <SecurityScanOutlined />
          </div>
          <div className="stat-content">
            <div className="stat-number">{new Set(alerts.map(a => a.source_ip)).size}</div>
            <div className="stat-label">Threat Sources</div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3>Real-Time Security Monitoring</h3>
          <div className="controls">
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
                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </Button>
              <Badge 
                count={alerts.length} 
                style={{ backgroundColor: '#ff4d4f' }}
              >
                <span style={{ fontWeight: '600' }}>Live Alerts</span>
              </Badge>
            </Space>
          </div>
        </div>

        {alerts.length === 0 && !loading && (
          <div className="alert-success">
            <h4>All Clear</h4>
            <p>No security threats detected in the last few minutes. Your network is secure.</p>
          </div>
        )}

        <div className="alerts-container">
          <List
            loading={loading}
            dataSource={alerts}
            renderItem={(alert, index) => {
              const confidenceLevel = getConfidenceLevel(alert.confidence);
              
              return (
                <List.Item key={index} className="alert-item">
                  <div className="alert-card">
                    <div className="alert-header">
                      <Space>
                        {getThreatTypeIcon(alert.threat_type)}
                        <span className="alert-title">
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
                        <span className="alert-timestamp">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </Space>
                    </div>
                    
                    <div className="alert-content">
                      <div className="alert-detail">
                        <strong>Source IP:</strong> 
                        <code className="ip-code critical">
                          {alert.source_ip}
                        </code>
                      </div>
                      <div className="alert-detail">
                        <strong>Description:</strong> {alert.description}
                      </div>
                      <div className="alert-detail">
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
                        <details className="raw-data-details">
                          <summary>Raw Data Analysis</summary>
                          <pre className="raw-data-pre">
                            {JSON.stringify(alert.raw_data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveAlerts;