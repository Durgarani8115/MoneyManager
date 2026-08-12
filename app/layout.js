import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata = {
  title: "Trakex - Personal Finance Manager",
  description: "Smart Personal Finance Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-background text-foreground antialiased min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
