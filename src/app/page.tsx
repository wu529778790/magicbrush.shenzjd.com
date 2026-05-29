"use client";

import { useState } from "react";
import { Button, Card, Col, Form, Input, Radio, Row, Select, Tabs, Typography, message, Spin } from "antd";
import { DownloadOutlined, PictureOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// 小红书风格选项
const XHS_STYLES = [
  { value: "cute", label: "甜美可爱" },
  { value: "fresh", label: "清新自然" },
  { value: "warm", label: "温暖舒适" },
  { value: "bold", label: "大胆醒目" },
  { value: "minimal", label: "极简精致" },
  { value: "retro", label: "复古怀旧" },
  { value: "pop", label: "活力炫彩" },
  { value: "notion", label: "极简手绘" },
  { value: "chalkboard", label: "黑板粉笔" },
  { value: "study-notes", label: "学习笔记" },
];

const XHS_LAYOUTS = [
  { value: "sparse", label: "简约" },
  { value: "balanced", label: "均衡" },
  { value: "dense", label: "密集" },
  { value: "list", label: "列表" },
  { value: "comparison", label: "对比" },
  { value: "flow", label: "流程" },
  { value: "mindmap", label: "思维导图" },
  { value: "quadrant", label: "四象限" },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "3:2", label: "3:2" },
  { value: "2:3", label: "2:3" },
];

interface ImageResult {
  url: string;
  type: "basic" | "xhs";
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [basicForm] = Form.useForm();
  const [xhsForm] = Form.useForm();

  // 基础图片生成
  const handleBasicGenerate = async (values: {
    prompt: string;
    ar?: string;
    quality?: string;
  }) => {
    setLoading(true);
    setImages([]);

    try {
      const payload: Record<string, unknown> = { prompt: values.prompt };
      if (values.ar) payload.ar = values.ar;
      if (values.quality) payload.quality = values.quality;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "生成失败");
        return;
      }

      setImages([{
        url: `data:image/png;base64,${data.image}`,
        type: "basic",
      }]);

      message.success(`生成完成，耗时 ${data.duration_ms}ms`);
    } catch {
      message.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  // 小红书图片生成
  const handleXhsGenerate = async (values: {
    content: string;
    style: string;
    layout: string;
  }) => {
    setLoading(true);
    setImages([]);

    try {
      const style = XHS_STYLES.find(s => s.value === values.style);
      const layout = XHS_LAYOUTS.find(l => l.value === values.layout);

      const prompt = `生成小红书风格的图片卡片。

内容：${values.content}

风格：${style?.label}
布局：${layout?.label}

要求：
1. 适合社交媒体分享
2. 文字清晰可读
3. 视觉效果吸引人`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          quality: "2k",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "生成失败");
        return;
      }

      setImages([{
        url: `data:image/png;base64,${data.image}`,
        type: "xhs",
      }]);

      message.success(`生成完成，耗时 ${data.duration_ms}ms`);
    } catch {
      message.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-${index + 1}.png`;
    a.click();
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "linear-gradient(180deg, #f8fafc 0%, #e0e7ff 100%)" }}>
      {/* Hero Section */}
      <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
        <Title level={1} style={{ marginBottom: 16, fontWeight: 700 }}>
          <ThunderboltOutlined style={{ color: "#4f46e5", marginRight: 12 }} />
          AI 图片生成
        </Title>
        <Paragraph style={{ fontSize: 18, color: "#64748b", maxWidth: 600, margin: "0 auto" }}>
          输入文字，一键生成精美图片。支持多种风格和尺寸。
        </Paragraph>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>
        <Row gutter={24}>
          {/* Left: Input */}
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              styles={{ body: { padding: 32 } }}
            >
              <Tabs
                defaultActiveKey="basic"
                items={[
                  {
                    key: "basic",
                    label: (
                      <span style={{ fontWeight: 500 }}>
                        <PictureOutlined style={{ marginRight: 6 }} />
                        基础生成
                      </span>
                    ),
                    children: (
                      <Form form={basicForm} layout="vertical" onFinish={handleBasicGenerate} initialValues={{ ar: "1:1", quality: "2k" }}>
                        <Form.Item name="prompt" label={<span style={{ fontWeight: 500 }}>描述你想生成的图片</span>} rules={[{ required: true, message: "请输入描述" }]}>
                          <TextArea rows={4} placeholder="例如：一只可爱的猫咪在阳光下睡觉，水彩画风格" style={{ borderRadius: 8 }} />
                        </Form.Item>
                        <Form.Item name="ar" label={<span style={{ fontWeight: 500 }}>宽高比</span>}>
                          <Radio.Group buttonStyle="solid" style={{ flexWrap: "wrap" }}>
                            {ASPECT_RATIOS.map(r => (
                              <Radio.Button key={r.value} value={r.value}>{r.label}</Radio.Button>
                            ))}
                          </Radio.Group>
                        </Form.Item>
                        <Form.Item name="quality" label={<span style={{ fontWeight: 500 }}>质量</span>}>
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value="normal">普通</Radio.Button>
                            <Radio.Button value="2k">2K</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                          <Button type="primary" htmlType="submit" loading={loading} block size="large" icon={<ThunderboltOutlined />} style={{ height: 48, borderRadius: 10, fontWeight: 600 }}>
                            生成图片
                          </Button>
                        </Form.Item>
                      </Form>
                    ),
                  },
                  {
                    key: "xhs",
                    label: (
                      <span style={{ fontWeight: 500 }}>
                        <ThunderboltOutlined style={{ marginRight: 6 }} />
                        小红书风格
                      </span>
                    ),
                    children: (
                      <Form form={xhsForm} layout="vertical" onFinish={handleXhsGenerate} initialValues={{ style: "cute", layout: "balanced" }}>
                        <Form.Item name="content" label={<span style={{ fontWeight: 500 }}>内容</span>} rules={[{ required: true, message: "请输入内容" }]}>
                          <TextArea rows={4} placeholder="输入你想生成卡片的内容..." style={{ borderRadius: 8 }} />
                        </Form.Item>
                        <Form.Item name="style" label={<span style={{ fontWeight: 500 }}>视觉风格</span>}>
                          <Select placeholder="选择风格">
                            {XHS_STYLES.map(s => (
                              <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item name="layout" label={<span style={{ fontWeight: 500 }}>信息布局</span>}>
                          <Select placeholder="选择布局">
                            {XHS_LAYOUTS.map(l => (
                              <Select.Option key={l.value} value={l.value}>{l.label}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                          <Button type="primary" htmlType="submit" loading={loading} block size="large" icon={<ThunderboltOutlined />} style={{ height: 48, borderRadius: 10, fontWeight: 600 }}>
                            生成小红书图片
                          </Button>
                        </Form.Item>
                      </Form>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* Right: Preview */}
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", minHeight: 500 }}
              styles={{ body: { padding: images.length > 0 ? 0 : 32 } }}
              title={<span style={{ fontWeight: 600 }}>预览</span>}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "120px 0" }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 20, color: "#64748b", fontSize: 16 }}>生成中...</div>
                </div>
              ) : images.length > 0 ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={images[0].url}
                    alt="Generated"
                    style={{ width: "100%", display: "block", borderRadius: "0 0 16px 16px" }}
                  />
                  <div style={{ position: "absolute", top: 16, right: 16 }}>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(images[0].url, 0)}
                      style={{ borderRadius: 8 }}
                    >
                      下载
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "120px 0", color: "#cbd5e1" }}>
                  <PictureOutlined style={{ fontSize: 80, marginBottom: 20 }} />
                  <div style={{ fontSize: 16 }}>输入描述后点击生成</div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
