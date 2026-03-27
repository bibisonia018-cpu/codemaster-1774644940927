import Hero from '@/components/Hero';
import BookingForm from '@/components/BookingForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <Hero />
      <div className="px-4">
        <BookingForm />
      </div>
    </div>
  );
}