// Layout component
import "./globals.css";
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { ConfirmProvider } from '@/hooks/use-confirm';

export const metadata = {
  title: "Trakex - Personal Finance Manager",
  description: "Smart Personal Finance Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ConfirmProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ConfirmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
