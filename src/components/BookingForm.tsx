import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle } from 'lucide-react';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendTelegramNotification } from '@/config/telegram';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM", "07:00 PM"
];

export default function BookingForm() {
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Real-time synchronization of available slots using Firebase
  useEffect(() => {
    if (!date) {
      setBookedSlots([]);
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('date', '==', date)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs.map(doc => doc.data().timeSlot);
      setBookedSlots(slots);
      
      // Auto-deselect if current selection gets booked by someone else
      if (timeSlot && slots.includes(timeSlot)) {
        setTimeSlot('');
        toast.error('Your selected slot was just booked by someone else!');
      }
    });

    return () => unsubscribe();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeSlot || !firstName || !lastName || !phone) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        firstName,
        lastName,
        phone,
        date,
        timeSlot,
        status: 'booked',
        createdAt: serverTimestamp()
      };

      // 1. Save to Firestore
      await addDoc(collection(db, 'appointments'), bookingData);

      // 2. Trigger Telegram Bot Notification
      await sendTelegramNotification(bookingData);

      toast.success("Booking confirmed successfully!");
      
      // Reset form
      setDate('');
      setTimeSlot('');
      setFirstName('');
      setLastName('');
      setPhone('');
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return format(today, 'yyyy-MM-dd');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto p-6 lg:p-10 mt-[-40px] relative z-10 glass-panel rounded-3xl"
    >
      <div className="flex items-center gap-3 mb-8">
        <CalendarIcon className="w-6 h-6 text-gold-500" />
        <h2 className="text-2xl font-bold">Book an Appointment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-400">Select Date</label>
          <input
            type="date"
            min={getTodayString()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTimeSlot('');
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
            required
          />
        </div>

        {/* Time Slots (Animated Grid) */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Clock className="w-4 h-4" /> Select Time
          </label>
          {date ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TIME_SLOTS.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = timeSlot === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setTimeSlot(slot)}
                    className={cn(
                      "py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border",
                      isBooked 
                        ? "bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed line-through"
                        : isSelected
                        ? "bg-gold-500 border-gold-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-gold-500/50 hover:bg-zinc-700"
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-zinc-500 italic p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
              Please select a date first to view real-time availability.
            </div>
          )}
        </div>

        {/* Personal Info */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <User className="w-4 h-4" /> Your Details
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              required
            />
          </div>
          <div className="relative">
            <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="tel"
              placeholder="Phone Number (e.g. +1 234 567 8900)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !date || !timeSlot}
          className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-gold-500 to-gold-600 text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5" /> Confirm Appointment
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}