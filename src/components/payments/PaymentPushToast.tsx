import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { subscribePaymentNotices, type PaymentNotice } from '../../services/paymentNotices';

const VISIBLE_MS = 6500;

export default function PaymentPushToast() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<PaymentNotice | null>(null);

  useEffect(() => subscribePaymentNotices(setCurrent), []);

  useEffect(() => {
    if (!current) return undefined;
    const timer = window.setTimeout(() => setCurrent(null), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] w-[min(100%-2rem,22rem)]">
      <AnimatePresence>
        {current && (
          <motion.article
            key={current.id}
            role="status"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto overflow-hidden rounded-2xl border border-[#e4e8f3] bg-white shadow-[0_18px_40px_rgba(23,33,63,0.16)]"
          >
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-[#17213f]">{current.title}</p>
              <p className="mt-1 text-sm leading-5 text-[#5b6685]">{current.body}</p>
              {current.actionLabel && current.href && (
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-[#263BAA]"
                  onClick={() => {
                    const href = current.href!;
                    setCurrent(null);
                    navigate(href);
                  }}
                >
                  {current.actionLabel}
                </button>
              )}
            </div>
            <motion.div
              className="h-1 bg-[#263BAA]"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: VISIBLE_MS / 1000, ease: 'linear' }}
            />
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}
