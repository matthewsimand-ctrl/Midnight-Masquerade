import { useEffect, useState } from "react";

export function Timer({ endTime }: { endTime: number | null }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endTime) return;
    
    const update = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!endTime) return null;

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
      <div className="text-sm text-neutral-500 uppercase tracking-widest mb-1">Time Remaining</div>
      <div className={`text-4xl font-mono ${timeLeft <= 10 ? 'text-red-500' : 'text-amber-500'}`}>
        00:{timeLeft.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
