import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "klay | Java 后端开发工程师",
  description:
    "klay 的个人主站，展示 Java 后端开发、微服务架构、高并发系统与 AI 工作流自动化相关经历、项目和技术文章。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
