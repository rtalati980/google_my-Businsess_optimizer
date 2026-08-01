import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Maps SEO Guide | BizLocalPilot AI',
  description: 'Complete Google Maps SEO guides for Indian cities. Learn how to rank #1 on Google Maps for your business.',
};

export default function GoogleMapsSEOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
