"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, User } from "lucide-react";
import toast from "react-hot-toast";

interface AdminProfile {
    id: string;
    name: string;
    role: string;
    avatar_color: string;
}

export default function ProfilesSelectorPage() {
    const router = useRouter();
    const [profiles, setProfiles] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch profiles
        fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/profiles")
            .then(res => res.json())
            .then(data => {
                if (data.profiles) setProfiles(data.profiles);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSelectProfile = async (profile: AdminProfile) => {
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/profiles/select", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profileId: profile.id })
            });
            if (res.ok) {
                toast.success(`Welcome, ${profile.name}`);
                router.push("/admin/dashboard");
            } else {
                throw new Error("Failed to select profile");
            }
        } catch (e) {
            toast.error("Could not activate profile.");
        }
    };

    if (loading) return <div className="min-h-screen bg-[var(--forest-dark)] flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[var(--forest-dark)] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Organic decorative shapes */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--forest-light)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-float" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--gold)] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-float-delayed" />
            
            <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-8 bg-white/5 border border-white/10 shadow-2xl">
                    <Leaf className="w-8 h-8 text-[var(--gold-light)]" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold font-serif mb-12">Who's working?</h1>

                <div className="flex flex-wrap justify-center gap-8">
                    {profiles.map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => handleSelectProfile(profile)}
                            className="group flex flex-col items-center gap-4 transition-transform hover:scale-105"
                        >
                            <div 
                                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl shadow-xl flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-white transition-colors"
                                style={{ backgroundColor: profile.avatar_color || '#1A3A2A' }}
                            >
                                <span className="text-4xl md:text-6xl font-bold font-serif uppercase tracking-widest text-white/90">
                                    {profile.name.charAt(0)}
                                </span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-medium text-white/90">{profile.name}</h3>
                                <p className="text-sm text-gray-400 capitalize">{profile.role}</p>
                            </div>
                        </button>
                    ))}

                    <button
                        onClick={() => toast("Profile creation requires Owner access in Settings.", { icon: "🔒" })}
                        className="group flex flex-col items-center gap-4 transition-transform hover:scale-105"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-2 border-dashed border-gray-600 flex items-center justify-center group-hover:border-white transition-colors hover:bg-white/5">
                            <User size={40} className="text-gray-500 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-400 group-hover:text-white">Add Profile</h3>
                    </button>
                </div>
            </div>
        </div>
    );
}
