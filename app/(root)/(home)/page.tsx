import MeetingTypeList from '@/components/MeetingTypeList';
import InspirationCard from '@/components/InspirationCard';

const Home = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <section className="page flex size-full flex-col gap-6 text-slate-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Time Display Card */}
        <div className="lg:col-span-2 relative h-[280px] overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500/90 to-blue-600/90">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-20"></div>
          <div className="relative z-10 flex h-full flex-col justify-between p-6">
            <h2 className="max-w-[260px] rounded-full bg-slate-200/95 px-5 py-2.5 text-center text-sm font-medium backdrop-blur-md text-slate-700">
              Upcoming Meeting at: 12:30 PM
            </h2>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">{time}</h1>
              <p className="text-base font-medium text-white/90 lg:text-xl">{date}</p>
            </div>
          </div>
        </div>

        <InspirationCard />
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
