"use client";

import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface Stats {
  totalGenerations: number;
  successCount: number;
  failCount: number;
  todayCount: number;
  avgDurationMs: number;
  providerStats: { provider: string; count: number }[];
}

const statCards = [
  { key: "totalGenerations", title: "Total Generations", icon: <ThunderboltOutlined />, color: "#4f46e5", bg: "#eef2ff" },
  { key: "successCount", title: "Success", icon: <CheckCircleOutlined />, color: "#16a34a", bg: "#f0fdf4" },
  { key: "failCount", title: "Failed", icon: <CloseCircleOutlined />, color: "#dc2626", bg: "#fef2f2" },
  { key: "todayCount", title: "Today", icon: <ClockCircleOutlined />, color: "#ea580c", bg: "#fff7ed" },
] as const;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <ThunderboltOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24, fontWeight: 600 }}>Dashboard</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map(({ key, title, icon, color, bg }) => (
          <Col xs={12} sm={6} key={key}>
            <Card
              bordered={false}
              style={{ borderRadius: 12 }}
              styles={{ body: { padding: "20px 24px" } }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color,
                  }}
                >
                  {icon}
                </div>
                <Statistic
                  title={<span style={{ color: "#64748b", fontSize: 13 }}>{title}</span>}
                  value={stats[key]}
                  valueStyle={{ fontSize: 28, fontWeight: 600, color: "#1e293b" }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            title="Avg Duration"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Statistic
              value={stats.avgDurationMs}
              suffix="ms"
              valueStyle={{ fontSize: 32, fontWeight: 600, color: "#4f46e5" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            title="Provider Usage"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={stats.providerStats}
              rowKey="provider"
              pagination={false}
              size="small"
              columns={[
                { title: "Provider", dataIndex: "provider", key: "provider" },
                { title: "Count", dataIndex: "count", key: "count" },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
