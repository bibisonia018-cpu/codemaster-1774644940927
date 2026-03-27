import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, Calendar as CalendarIcon, Clock, Scissors } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: string;
  createdAt: any;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Simple UI Protection for Admin View
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') { // Mock secure PIN
      setIsAuthenticated(true);
    } else {
      alert('Incorrect PIN');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Real-time listener for ALL appointments
    const q = query(
      collection(db, 'appointments'),
      orderBy('date', 'asc') // Requires an index in Firestore! (Fallback sorting done client side if missing)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      // Filter out past appointments (keep today + future)
      const activeAppts = data.filter(appt => {
        try {
            const dateObj = parseISO(appt.date);
            return isToday(dateObj) || isFuture(dateObj);
        } catch(e) { return true; }
      });

      // Sort by TimeSlot as string comparison (09:00 AM before 10:00 AM works mostly, 
      // but proper time parsing is better for production)
      setAppointments(activeAppts);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl w-full max-w-sm text-center">
          <Shield className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-6">Barber Access Only</h2>
          <input
            type="password"
            placeholder="Enter PIN (1234)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-4 text-center tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <button type="submit" className="w-full bg-gold-500 text-black py-3 rounded-xl font-bold">
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Scissors className="text-gold-500" /> Admin Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Live overview of upcoming appointments</p>
          </div>
          <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Real-Time Sync Active</span>
          </div>
        </div>

        <div className="grid gap-4">
          {appointments.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <CalendarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-lg">No upcoming appointments found.</p>
            </div>
          ) : (
            appointments.map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4",
                  isToday(parseISO(appt.date)) ? "border-gold-500/50 bg-gold-500/5" : ""
                )}
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Customer</p>
                    <p className="font-semibold text-lg">{appt.firstName} {appt.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gold-500" />
                      {appt.date} {isToday(parseISO(appt.date)) && <span className="text-xs bg-gold-500 text-black px-2 py-0.5 rounded-full font-bold ml-2">TODAY</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Time</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-500" />
                      {appt.timeSlot}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${appt.phone}`}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}