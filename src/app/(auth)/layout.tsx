interface AuthLayoutProps {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return ( 
    <div className="relative bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 h-full flex flex-col overflow-hidden">
      {/* Animated fitness pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-9xl">🏋️</div>
        <div className="absolute top-20 right-20 text-8xl">🥗</div>
        <div className="absolute bottom-20 left-20 text-7xl">💪</div>
        <div className="absolute bottom-10 right-10 text-9xl">🍎</div>
        <div className="absolute top-1/2 left-1/3 text-6xl">🥑</div>
        <div className="absolute top-1/3 right-1/4 text-7xl">🏃</div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)] z-[1]" />
      
      <div className="z-[4] h-full w-full flex flex-col items-center justify-center">
        <div className="h-full w-full md:h-auto md:w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
};
 
export default AuthLayout;
