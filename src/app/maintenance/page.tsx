import Image from "next/image";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--cream)" }}>
            <div className="max-w-md w-full animate-fade-in-up">
                <div className="relative w-32 h-32 mx-auto mb-8 animate-float">
                    <img
                        src="/images/logo.png"
                        alt="Krishna Naturals Logo"
                        className="object-contain"
                    />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest-dark)" }}>
                    We're Upgrading!
                </h1>

                <p className="text-lg mb-8" style={{ color: "var(--gray-600)" }}>
                    Our forest bees are working hard behind the scenes to bring you a sweeter experience. Krishna Naturals is temporarily down for scheduled maintenance.
                </p>

                <div className="h-0.5 w-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50"></div>

                <p className="text-sm font-medium tracking-wide uppercase" style={{ color: "var(--gold-dark)" }}>
                    We&apos;ll be back online shortly.
                </p>
                <p className="text-xs mt-4 text-gray-400">
                    If you have an urgent order issue, please email <a href="mailto:support@krishnanaturals.co.in" className="underline hover:text-[var(--gold)]">support@krishnanaturals.co.in</a>.
                </p>
            </div>
        </div>
    );
}
