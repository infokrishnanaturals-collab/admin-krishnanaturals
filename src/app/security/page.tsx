import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Security & Bug Bounty — Krishna Naturals",
    description: "Learn about our security practices and responsible disclosure policy. Report vulnerabilities and help us keep Krishna Naturals safe.",
};

export default function SecurityPage() {
    return (
        <div style={{ paddingTop: "6rem", minHeight: "100vh", background: "var(--cream)" }}>
            <div className="max-w-3xl mx-auto px-6 py-16">

                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6" style={{ background: "var(--forest-muted)" }}>
                        🛡️
                    </div>
                    <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest-dark)" }}>
                        Security & Bug Bounty
                    </h1>
                    <p className="text-lg" style={{ color: "var(--gray-500)" }}>
                        We take the security of our platform and your data very seriously.
                    </p>
                </div>

                {/* Security Practices */}
                <section className="mb-14">
                    <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--forest-dark)", fontFamily: "'Playfair Display', serif" }}>
                        🔒 Our Security Practices
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
                        {[
                            { icon: "🔐", title: "HTTPS Everywhere", desc: "All data transmitted between your browser and our servers is encrypted using TLS 1.3 with HSTS preloading." },
                            { icon: "🛡️", title: "Security Headers", desc: "We enforce Content-Security-Policy, X-Frame-Options, X-XSS-Protection, and strict Referrer-Policy on every page." },
                            { icon: "🔑", title: "Secure Authentication", desc: "We use Firebase Authentication with Google OAuth 2.0, magic links, and secure session cookies (HttpOnly, SameSite, Secure)." },
                            { icon: "💳", title: "PCI-Compliant Payments", desc: "All payments are processed securely through Razorpay. We never store your card details on our servers." },
                            { icon: "🗃️", title: "Database Security", desc: "Our database is protected with Row Level Security (RLS) policies, ensuring users can only access their own data." },
                            { icon: "📧", title: "Email Security", desc: "Transactional emails are sent via Resend with SPF, DKIM, and DMARC authentication on our domain." },
                            { icon: "🚫", title: "No Technology Fingerprinting", desc: "We disable the X-Powered-By header to prevent attackers from identifying our tech stack." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <span className="text-2xl mt-0.5">{item.icon}</span>
                                <div>
                                    <h3 className="font-bold text-base mb-1" style={{ color: "var(--gray-800)" }}>{item.title}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--gray-500)" }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bug Bounty */}
                <section className="mb-14">
                    <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--forest-dark)", fontFamily: "'Playfair Display', serif" }}>
                        🐛 Responsible Disclosure & Bug Bounty
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--gray-600)" }}>
                            We value the security community and encourage responsible disclosure of any vulnerabilities found on our platform. If you discover a security issue, we kindly ask you to follow our disclosure policy below.
                        </p>

                        <h3 className="font-bold text-base mb-3" style={{ color: "var(--forest-dark)" }}>In Scope</h3>
                        <ul className="list-disc pl-6 text-sm space-y-2 mb-6" style={{ color: "var(--gray-600)" }}>
                            <li>Cross-Site Scripting (XSS)</li>
                            <li>Cross-Site Request Forgery (CSRF)</li>
                            <li>SQL Injection & NoSQL Injection</li>
                            <li>Authentication / Authorization bypass</li>
                            <li>Server-Side Request Forgery (SSRF)</li>
                            <li>Insecure Direct Object References (IDOR)</li>
                            <li>Sensitive data exposure</li>
                            <li>Remote Code Execution (RCE)</li>
                        </ul>

                        <h3 className="font-bold text-base mb-3" style={{ color: "var(--forest-dark)" }}>Out of Scope</h3>
                        <ul className="list-disc pl-6 text-sm space-y-2 mb-6" style={{ color: "var(--gray-500)" }}>
                            <li>Rate limiting / brute force without demonstrable impact</li>
                            <li>Missing cookie flags on non-session cookies</li>
                            <li>Email spoofing / SPF / DKIM misconfigurations (report separately)</li>
                            <li>Denial of Service (DoS / DDoS) attacks</li>
                            <li>Social engineering attacks on employees</li>
                            <li>Physical security attacks</li>
                        </ul>

                        <h3 className="font-bold text-base mb-3" style={{ color: "var(--forest-dark)" }}>How to Report</h3>
                        <div className="rounded-xl p-6 mb-6" style={{ background: "var(--forest-muted)" }}>
                            <p className="text-sm mb-3" style={{ color: "var(--gray-700)" }}>
                                Send your findings to:
                            </p>
                            <a
                                href="mailto:security@krishnanaturals.co.in"
                                className="text-lg font-bold block mb-3"
                                style={{ color: "var(--forest-dark)" }}
                            >
                                security@krishnanaturals.co.in
                            </a>
                            <p className="text-sm" style={{ color: "var(--gray-600)" }}>
                                Please include a detailed description, steps to reproduce, screenshots/video proof, and the potential impact of the vulnerability.
                            </p>
                        </div>

                        <h3 className="font-bold text-base mb-3" style={{ color: "var(--forest-dark)" }}>Our Commitment</h3>
                        <ul className="list-none text-sm space-y-3" style={{ color: "var(--gray-600)" }}>
                            <li className="flex gap-2 items-start"><span>✅</span> We will acknowledge your report within 48 hours.</li>
                            <li className="flex gap-2 items-start"><span>✅</span> We will investigate and provide a timeline for resolution.</li>
                            <li className="flex gap-2 items-start"><span>✅</span> We will credit you publicly (with your permission) in our Security Hall of Fame.</li>
                            <li className="flex gap-2 items-start"><span>✅</span> We will not pursue legal action against researchers acting in good faith.</li>
                            <li className="flex gap-2 items-start"><span>🎁</span> Qualifying reports may be eligible for a reward at our discretion.</li>
                        </ul>
                    </div>
                </section>

                {/* Security Hall of Fame */}
                <section className="mb-14">
                    <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--forest-dark)", fontFamily: "'Playfair Display', serif" }}>
                        🏆 Security Hall of Fame
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                        <p className="text-sm" style={{ color: "var(--gray-500)" }}>
                            No reports yet. Be the first to responsibly disclose a vulnerability and get featured here!
                        </p>
                    </div>
                </section>

                {/* Footer note */}
                <div className="text-center">
                    <p className="text-xs" style={{ color: "var(--gray-400)" }}>
                        Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })} • Krishna Naturals Security Team
                    </p>
                </div>

            </div>
        </div>
    );
}
