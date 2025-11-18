import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return ( 
    <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 h-full overflow-hidden">
      {/* Subtle fitness pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl">🏋️</div>
        <div className="absolute top-40 right-20 text-8xl">🥗</div>
        <div className="absolute bottom-40 left-1/4 text-7xl">💪</div>
        <div className="absolute bottom-20 right-1/3 text-9xl">🍎</div>
        <div className="absolute top-1/2 right-10 text-6xl">🥑</div>
      </div>
      
      <Sidebar />
      <div className="lg:pl-[300px] flex flex-col h-full">
        <Navbar />
        <main className="bg-white/80 backdrop-blur-sm flex-1 overflow-auto p-8 lg:rounded-tl-2xl shadow-inner">
          {children}
        </main>
      </div>
    </div>
  );
};
 
export default DashboardLayout;
