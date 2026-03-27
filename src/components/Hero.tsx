import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
      
      <div className="relative max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-900/80 p-4 rounded-full border border-gold-500/30 text-gold-500 mb-6 backdrop-blur-md"
        >
          <Scissors className="w-8 h-8" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
            QLF
          </span> Barber Shop
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl"
        >
          Premium grooming for the modern gentleman. 
          Experience master craftsmanship, precision fading, and top-tier service.
        </motion.p>
      </div>
    </div>
  );
}