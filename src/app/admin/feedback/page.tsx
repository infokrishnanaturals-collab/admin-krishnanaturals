"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type TicketMessage = {
    id: string;
    sender_type: 'user' | 'admin' | 'system';
    message: string;
    created_at: string;
};

type SupportTicket = {
    id: string;
    subject: string;
    message: string; // Original message
    status: string;
    created_at: string;
    guest_email?: string;
    user_id?: string;
    profiles?: { email?: string; };
    support_ticket_messages?: TicketMessage[];
    customer_email?: string;
    customer_name?: string;
    ticket_messages?: TicketMessage[];
};

export default function AdminFeedbackPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/feedback");
            if (!res.ok) throw new Error("Failed to fetch tickets");
            
            const data = await res.json();
            
            if (data) {
                // Sort messages for each ticket
                const sortedData = data.map((t: any) => ({
                    ...t,
                    ticket_messages: (t.ticket_messages || []).sort(
                        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                }));
                setTickets(sortedData);
            }
        } catch (e) {
            toast.error("Failed to load tickets");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/feedback", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: ticketId, status: newStatus })
            });
            if (!res.ok) throw new Error("Update failed");

            toast.success(`Ticket marked as ${newStatus}`);
            fetchTickets();
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handleSendReply = async (ticket: SupportTicket) => {
        if (!replyDraft.trim()) return toast.error("Reply cannot be empty!");

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/admin/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticket_id: ticket.id, message: replyDraft })
            });

            if (!res.ok) throw new Error("Failed to send reply");
        } catch (e) {
            toast.error("Failed to save message.");
            return;
        }

        // 3. Send the email to the user
        const customerEmail = ticket.customer_email;
        if (customerEmail) {
            try {
                await fetch(process.env.NEXT_PUBLIC_API_URL + '/emails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: customerEmail,
                        type: 'TICKET_REPLY',
                        payload: {
                            subject: ticket.subject,
                            reply: replyDraft
                        }
                    })
                });
                toast.success("Reply sent and recorded.");
            } catch (emailErr) {
                console.error("Failed to send reply email:", emailErr);
                toast.error("Saved in DB, but email failed.");
            }
        }

        setReplyingTo(null);
        setReplyDraft("");
        fetchTickets();
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--forest)]"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-heading mb-1">
                        Support Center
                    </h1>
                    <p className="admin-subheading">Manage customer conversations and tickets.</p>
                </div>
                <button onClick={fetchTickets} className="text-sm font-bold hover:underline text-[var(--forest)]">Refresh</button>
            </div>

            <div className="space-y-8">
                {tickets.map((ticket) => {
                    const customerEmail = ticket.customer_email || "Unknown User";
                    const customerName = ticket.customer_name || "Unknown User";

                    return (
                        <div key={ticket.id} className="admin-panel mb-6 flex flex-col md:flex-row p-0 overflow-hidden fade-in fade-in-delay-1 border border-gray-200">
                            {/* Left Side: Ticket Meta */}
                            <div className="w-full md:w-64 p-6 border-b md:border-b-0 md:border-r bg-gray-50 border-gray-200">
                                <div className={`inline-block px-3 py-1 text-[10px] font-bold uppercase rounded-full mb-4 ${
                                    ticket.status === 'open' ? 'bg-orange-100 text-orange-700' :
                                    ticket.status === 'replied' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                    {ticket.status}
                                </div>
                                <h3 className="font-bold text-sm mb-2 leading-tight text-gray-900">{ticket.subject}</h3>
                                <div className="space-y-3 mt-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Customer</p>
                                        <p className="text-sm font-bold text-gray-900 truncate" title={customerName}>{customerName}</p>
                                        <p className="text-xs font-medium truncate text-gray-500" title={customerEmail}>{customerEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Created</p>
                                        <p className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <p className="text-[10px] uppercase tracking-wider font-bold mb-3 text-gray-500">Quick Actions</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => handleUpdateStatus(ticket.id, 'closed')} className="admin-btn-secondary py-1.5 px-3 text-[10px]">Close</button>
                                        <button onClick={() => handleUpdateStatus(ticket.id, 'open')} className="admin-btn-secondary py-1.5 px-3 text-[10px]">Re-open</button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Conversation */}
                            <div className="flex-1 p-6 flex flex-col bg-white">
                                <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto mb-6 pr-2 scrollbar-thin">
                                    {/* Conversation Messages */}
                                    {ticket.ticket_messages?.map((msg: TicketMessage) => (
                                        <div key={msg.id} className={`flex flex-col max-w-[90%] ${msg.sender_type === 'admin' ? 'items-end self-end ml-auto' : 'items-start'}`}>
                                            <div className={`p-4 rounded-2xl text-sm ${
                                                msg.sender_type === 'admin' 
                                                ? 'rounded-tr-none bg-[var(--forest)] text-white' 
                                                : msg.sender_type === 'system'
                                                ? 'italic w-full text-center bg-orange-50 text-orange-600'
                                                : 'rounded-tl-none bg-gray-100 text-gray-800'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[10px] mt-1 mx-1 text-gray-400">
                                                {msg.sender_type.toUpperCase()} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Input */}
                                <div className="mt-auto pt-6 border-t border-gray-100">
                                    {replyingTo === ticket.id ? (
                                        <div className="space-y-4">
                                            <textarea
                                                rows={3}
                                                value={replyDraft}
                                                onChange={(e) => setReplyDraft(e.target.value)}
                                                className="w-full admin-input p-4 text-sm"
                                                placeholder="Type your message to the customer..."
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setReplyingTo(null)} className="admin-btn-secondary px-4 py-2 text-xs">Discard</button>
                                                <button onClick={() => handleSendReply(ticket)} className="admin-btn-primary px-6 py-2 text-xs">
                                                    SEND REPLY
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setReplyingTo(ticket.id); setReplyDraft(""); }}
                                            className="w-full py-4 text-sm font-bold border-2 border-dashed border-[var(--forest-light)] text-[var(--forest)] rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-[var(--forest)]"
                                        >
                                            <Plus size={16} /> ADD NEW MESSAGE
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {tickets.length === 0 && (
                    <div className="text-center py-20 admin-panel border-2 border-dashed border-gray-200">
                        <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="font-medium text-gray-500">No support tickets found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const Plus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14" /></svg>
);

const MessageSquare = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
