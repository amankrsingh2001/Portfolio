import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'



type LayoutProps = {
    children: ReactNode
  }
export default function Layout({ children }:LayoutProps) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}