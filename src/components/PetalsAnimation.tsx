import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export const PetalsAnimation = () => {
  const [petals, setPetals] = useState<Array<{ id: number; left: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${3 + Math.random() * 2}s`,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute text-4xl animate-fall"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
          }}
        >
          🌸
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gradient-to-r from-success to-secondary text-white px-8 py-6 rounded-2xl shadow-2xl animate-pulse-glow">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Congratulations!!!</h2>
            <Sparkles className="h-8 w-8" />
          </div>
          <p className="text-xl text-center">The code is correct with no bugs! 🎉</p>
        </div>
      </div>
    </div>
  );
};
