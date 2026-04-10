import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-white">
      <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-4">
        <span className="text-white text-3xl">👗</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Wardrobe</h1>
      <p className="text-sm text-gray-400 mt-1">Your digital closet</p>
    </div>
  );
}
