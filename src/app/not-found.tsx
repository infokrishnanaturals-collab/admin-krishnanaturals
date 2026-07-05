import Link from 'next/link';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-6" style={{ paddingTop: "6rem" }}>
            <div className="max-w-md w-full text-center py-12 animate-fade-in-up">
                {/* Honey Pot SVG Graphic */}
                <div className="relative w-40 h-40 mx-auto mb-8 animate-float">
                    <svg viewBox="0 0 200 200" className="w-full h-full fill-[var(--forest)]">
                        {/* Golden honey dripping */}
                        <path d="M 60 40 L 140 40 Q 150 40 150 50 L 145 70 Q 140 75 140 85 Q 140 100 150 105 Q 170 115 160 150 Q 150 170 100 170 Q 50 170 40 150 Q 30 115 50 105 Q 60 100 60 85 Q 60 75 55 70 L 50 50 Q 50 40 60 40 Z" />
                        <rect x="55" y="30" width="90" height="15" rx="5" fill="#C9A84C" />
                        <ellipse cx="100" cy="30" rx="35" ry="8" fill="#A68A3E" />
                        {/* Drip */}
                        <path d="M 90 45 C 90 75 110 75 110 45" stroke="#E8A317" strokeWidth="8" strokeLinecap="round" fill="none" />
                        <circle cx="100" cy="115" r="28" fill="#C9A84C" opacity="0.15" />
                        <text x="100" y="123" textAnchor="middle" fill="#C9A84C" fontWeight="bold" fontSize="24" fontFamily="serif">404</text>
                    </svg>
                </div>

                <h1 className="text-4xl font-extrabold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest-dark)" }}>
                    Sweetness Lost!
                </h1>
                
                <p className="text-sm mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: "var(--gray-500)" }}>
                    The page you are looking for has wandered off the forest trail. Let us guide you back to the golden hive.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="btn btn-primary shadow-lg flex items-center justify-center gap-2">
                        <Home size={16} /> Return Home
                    </Link>
                    <Link href="/shop" className="btn btn-outline flex items-center justify-center gap-2">
                        <ShoppingBag size={16} /> Explore Shop
                    </Link>
                </div>
            </div>
        </div>
    );
}
