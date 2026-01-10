export const metadata = {
  title: 'MathResearchPilot - Research Copilot for Mathematicians',
  description: 'An open-source research execution system for mathematicians. Turn vague research ideas into executable, supervised, and explainable daily research tasks.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', background: '#fafafa' }}>
        {children}
      </body>
    </html>
  )
}
