import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider, SignIn } from "@clerk/nextjs";
import CreateEventDrawer from "@/components/create-drawer";

export const metadata = {
  title: "Schedulrr",
  description: "Work Scheduling app",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} suppressHydrationWarning={true}>
          {/* header */}
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
            {children}
          </main>
          {/* footer */}
          <footer className="bg-blue-100 py-10">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with love by Pravit Naik</p>
            </div>
          </footer>
          <CreateEventDrawer />
        </body>
      </html>
    </ClerkProvider>
  );
}
