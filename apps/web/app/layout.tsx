import './globals.css'

export const metadata = {
  title: 'MathResearchPilot - 数学研究助手',
  description: '面向数学研究者的开源研究执行系统：推荐课题、检索论文、生成可执行路线，并监督每日完成情况。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div id="root-content">{children}</div>
      </body>
    </html>
  )
}
