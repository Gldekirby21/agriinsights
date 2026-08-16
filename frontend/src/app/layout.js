import './globals.css';

export const metadata = {
  title: 'AgriInsights — Multi-Modal Analytics for Farmers',
  description:
    'AgriInsights: Integrating Multi-Modal Analytics for Data-Driven Farmer Assistance. Built for South East Asian Institute of Technology, Inc. — IT ELEC 4.',
  keywords: 'agriculture, analytics, farmer, AI, smart farming, South Cotabato, SEAIT',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌾</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
