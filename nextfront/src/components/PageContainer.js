import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PageContainer({ children }) {
  return (
    <div className="container py-4">
      <Header />
      <main className="mb-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}