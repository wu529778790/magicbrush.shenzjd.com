"use client";

import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Radio, Row, Select, Typography, message, Spin } from "antd";
import { DownloadOutlined, PictureOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;

const PROVIDERS = [
  { value: "zai", label: "Z.AI (智谱)" },
  { value: "xiaomi", label: "小米" },
];

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        form.setFieldsValue({
          provider: data.default_provider || "zai",
          model: data.zai_model || "",
          ar: data.default_ar || "1:1",
          quality: data.default_quality || "2k",
        });
      });
  }, [form]);

  const handleProviderChange = (provider: string) => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const modelKey = `${provider}_model`;
        form.setFieldValue("model", data[modelKey] || "");
      });
  };

  const handleGenerate = async (values: {
    prompt: string;
    provider?: string;
    model?: string;
    ar?: string;
    quality?: string;
  }) => {
    setLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "生成失败");
        return;
      }

      setImageUrl(`data:image/png;base64,${data.image}`);
      message.success(`生成完成，耗时 ${data.duration_ms}ms，使用 ${data.provider}`);
    } catch {
      message.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `generated-${Date.now()}.png`;
    a.click();
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24, fontWeight: 600 }}>生成图片</Title>
      <Row gutter={24}>
        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: 12 }} styles={{ body: { padding: "24px 28px" } }}>
            <Form form={form} layout="vertical" onFinish={handleGenerate} initialValues={{ ar: "1:1", quality: "2k" }}>
              <Form.Item name="prompt" label={<span style={{ fontWeight: 500 }}>提示词</span>} rules={[{ required: true, message: "请输入提示词" }]}>
                <TextArea rows={4} placeholder="描述你想生成的图片..." style={{ borderRadius: 8 }} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="provider" label={<span style={{ fontWeight: 500 }}>服务商</span>}>
                    <Select onChange={handleProviderChange}>
                      {PROVIDERS.map((p) => (
                        <Select.Option key={p.value} value={p.value}>{p.label}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="model" label={<span style={{ fontWeight: 500 }}>模型</span>}>
                    <Input placeholder="默认模型" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="ar" label={<span style={{ fontWeight: 500 }}>宽高比</span>}>
                    <Radio.Group buttonStyle="solid">
                      <Radio.Button value="1:1">1:1</Radio.Button>
                      <Radio.Button value="16:9">16:9</Radio.Button>
                      <Radio.Button value="9:16">9:16</Radio.Button>
                      <Radio.Button value="4:3">4:3</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="quality" label={<span style={{ fontWeight: 500 }}>质量</span>}>
                    <Radio.Group buttonStyle="solid">
                      <Radio.Button value="normal">普通</Radio.Button>
                      <Radio.Button value="2k">2K</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: 44, borderRadius: 8, fontWeight: 500 }}>
                  生成
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: imageUrl ? 0 : 24 } }}
            title={<span style={{ fontWeight: 500 }}>结果</span>}
            extra={
              imageUrl && (
                <Button icon={<DownloadOutlined />} onClick={handleDownload} style={{ borderRadius: 8 }}>
                  下载
                </Button>
              )
            }
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: "#64748b" }}>生成中...</div>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt="Generated" style={{ width: "100%", display: "block", borderRadius: "0 0 12px 12px" }} />
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#cbd5e1" }}>
                <PictureOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <div>输入提示词后点击生成</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
