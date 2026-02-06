import "./globals.css";

export const metadata = {
  title: "Swoovie",
  description: "Movie preferences app"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
