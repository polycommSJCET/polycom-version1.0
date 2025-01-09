'use client';
import Lottie from 'react-lottie-player';
import teamAnimation from '../public/animations/team-collaboration.json';

const InspirationCard = () => {
  return (
    <div className="group relative h-[280px] rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]">
      {/* Glass background with gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md" />
      
      {/* Content wrapper */}
      <div className="relative flex h-full flex-col items-center justify-between">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-800">
            Welcome back! 👋
          </h3>
          <p className="text-sm text-slate-600 font-medium">
            Ready for meaningful conversations today?
          </p>
        </div>

        <div className="-my-4 flex flex-1 items-center justify-center">
          <Lottie
            loop
            animationData={teamAnimation}
            play
            style={{ width: '100%', maxWidth: '220px' }}
          />
        </div>

        <div className="w-full">
          <div className="flex items-center justify-center gap-3">
            <span className="size-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/30 animate-[pulse_2s_ease-in-out_infinite]" />
            <p className="text-sm font-medium text-slate-600">
              {/* 12 team members online */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspirationCard;
