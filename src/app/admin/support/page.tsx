"use client";

import { useEffect, useState, useRef } from "react";
import { MessageSquare, User, Clock, Search, MoreVertical, Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

// We use the custom client that attaches Firebase JWT tokens for RLS
const supabase = createClient();

interface Ticket {
    id: string;
    customer_email: string;
    customer_name: string;
    status: 'open' | 'pending' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    subject: string;
    assigned_profile_id: string | null;
    created_at: string;
    updated_at: string;
}

interface Message {
    id: string;
    ticket_id: string;
    sender_type: 'customer' | 'admin' | 'system';
    sender_id: string | null;
    message: string;
    created_at: string;
}

interface Profile {
    id: string;
    name: string;
    avatar_color: string;
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter states
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('open');
    const [searchQuery, setSearchQuery] = useState("");

    // Mobile view states
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        loadInitialData();
        setupRealtime();

        return () => {
            supabase.removeAllChannels();
        };
    }, []);

    useEffect(() => {
        if (activeTicket) {
            loadMessages(activeTicket.id);
            if (window.innerWidth < 1024) setShowSidebar(false);
        }
    }, [activeTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadInitialData = async () => {
        setLoading(true);
        // Load tickets
        const { data: ticketsData } = await supabase
            .from('support_tickets')
            .select('*')
            .order('updated_at', { ascending: false });
        
        if (ticketsData) setTickets(ticketsData);

        // Load profiles for assignment
        const { data: profilesData } = await supabase
            .from('admin_profiles')
            .select('id, name, avatar_color');
        
        if (profilesData) setProfiles(profilesData);

        setLoading(false);
    };

    const loadMessages = async (ticketId: string) => {
        const { data } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
        
        if (data) setMessages(data);
    };

    const setupRealtime = () => {
        // Listen for new tickets
        supabase.channel('tickets_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTickets(prev => [payload.new as Ticket, ...prev]);
                    toast.success('New ticket received!');
                } else if (payload.eventType === 'UPDATE') {
                    setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new as Ticket : t));
                    if (activeTicket?.id === payload.new.id) {
                        setActiveTicket(payload.new as Ticket);
                    }
                }
            })
            .subscribe();

        // Listen for new messages
        supabase.channel('messages_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages' }, (payload) => {
                const newMessage = payload.new as Message;
                setMessages(prev => [...prev, newMessage]);
                
                // If it's for another ticket, we could show a toast
                if (activeTicket && newMessage.ticket_id !== activeTicket.id && newMessage.sender_type === 'customer') {
                    toast('New reply on another ticket');
                }
            })
            .subscribe();
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeTicket) return;

        const text = replyText;
        setReplyText("");

        // Insert message
        const { error } = await supabase
            .from('ticket_messages')
            .insert({
                ticket_id: activeTicket.id,
                sender_type: 'admin',
                message: text
            });

        if (error) {
            toast.error("Failed to send message");
            console.error(error);
        } else {
            // Update ticket updated_at
            await supabase
                .from('support_tickets')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', activeTicket.id);
        }
    };

    const updateTicketStatus = async (status: 'open' | 'pending' | 'closed') => {
        if (!activeTicket) return;
        const { error } = await supabase
            .from('support_tickets')
            .update({ status })
            .eq('id', activeTicket.id);
        
        if (error) toast.error("Failed to update status");
        else toast.success(`Ticket marked as ${status}`);
    };

    const reassignTicket = async (profileId: string) => {
        if (!activeTicket) return;
        const { error } = await supabase
            .from('support_tickets')
            .update({ assigned_profile_id: profileId })
            .eq('id', activeTicket.id);
        
        if (error) toast.error("Failed to reassign");
        else toast.success("Ticket reassigned!");
    };

    const filteredTickets = tickets.filter(t => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (searchQuery && !t.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) && !t.subject?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-[var(--forest)] border-t-transparent rounded-full" /></div>;

    return (
        <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-64px)] max-w-7xl mx-auto flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            
            {/* Left Pane - Ticket List */}
            <div className={`w-full lg:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50 absolute lg:relative z-10 h-full transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-bold text-[var(--forest-dark)] mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" /> Inbox
                    </h2>
                    <div className="relative mb-3">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search tickets..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[var(--forest-muted)]"
                        />
                    </div>
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        {(['open', 'closed', 'all'] as const).map(s => (
                            <button 
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`flex-1 text-xs py-1.5 rounded-md font-medium capitalize transition-colors ${filterStatus === s ? 'bg-white shadow-sm text-[var(--forest-dark)]' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredTickets.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 text-sm">No tickets found</div>
                    ) : filteredTickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => setActiveTicket(ticket)}
                            className={`w-full text-left p-3 rounded-xl transition-colors ${activeTicket?.id === ticket.id ? 'bg-[var(--forest-muted)] text-[var(--forest-dark)]' : 'hover:bg-white bg-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm truncate pr-2">{ticket.customer_name || ticket.customer_email.split('@')[0]}</span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(ticket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate mb-2">{ticket.subject || 'No subject'}</div>
                            <div className="flex justify-between items-center">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {ticket.status}
                                </span>
                                {ticket.assigned_profile_id && (
                                    <div className="w-5 h-5 rounded-full bg-[var(--forest)] text-white flex items-center justify-center text-[8px] font-bold" title="Assigned">
                                        {profiles.find(p => p.id === ticket.assigned_profile_id)?.name.charAt(0) || 'A'}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Center Pane - Chat View */}
            <div className="flex-1 flex flex-col h-full bg-white relative">
                {!activeTicket ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a ticket to view conversation</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 bg-white flex-shrink-0 z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--forest)] to-[var(--forest-light)] flex items-center justify-center text-white font-bold">
                                    {activeTicket.customer_name?.charAt(0) || activeTicket.customer_email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{activeTicket.customer_name || activeTicket.customer_email}</h3>
                                    <p className="text-xs text-gray-500 truncate">{activeTicket.customer_email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {activeTicket.status === 'open' ? (
                                    <button onClick={() => updateTicketStatus('closed')} className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Resolve
                                    </button>
                                ) : (
                                    <button onClick={() => updateTicketStatus('open')} className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                        Reopen
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gray-50/50">
                            {messages.length === 0 && (
                                <div className="text-center text-xs text-gray-400 py-4">No messages yet. Say hello!</div>
                            )}
                            {messages.map(msg => {
                                const isAdmin = msg.sender_type === 'admin';
                                const isSystem = msg.sender_type === 'system';

                                if (isSystem) {
                                    return (
                                        <div key={msg.id} className="flex justify-center my-4">
                                            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.message}</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                            isAdmin 
                                            ? 'bg-[var(--forest)] text-white rounded-br-none' 
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.message}</p>
                                            <div className={`text-[9px] mt-1 text-right ${isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendReply} className="flex items-end gap-2 relative">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--forest-muted)]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendReply(e);
                                        }
                                    }}
                                />
                                <button 
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--forest)] text-white disabled:opacity-50 disabled:bg-gray-300 hover:bg-[var(--forest-dark)] transition-colors flex-shrink-0"
                                >
                                    <Send className="w-5 h-5 -ml-1" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* Right Pane - Ticket Details (Desktop only) */}
            {activeTicket && (
                <div className="hidden xl:flex w-72 flex-col border-l border-gray-100 bg-gray-50">
                    <div className="p-5 border-b border-gray-100 bg-white">
                        <h3 className="font-bold text-sm text-gray-900 mb-4">Ticket Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400">Status</label>
                                <div className="mt-1 capitalize text-sm font-medium text-gray-800">{activeTicket.status}</div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400">Priority</label>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <AlertCircle className={`w-4 h-4 ${activeTicket.priority === 'urgent' ? 'text-red-500' : 'text-gray-400'}`} />
                                    <span className="capitalize text-sm font-medium text-gray-800">{activeTicket.priority}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400">Assigned To</label>
                                <select 
                                    value={activeTicket.assigned_profile_id || ""}
                                    onChange={(e) => reassignTicket(e.target.value)}
                                    className="mt-1 w-full text-sm border-gray-200 rounded-lg bg-gray-50 py-1.5 px-2 focus:ring-[var(--forest)]"
                                >
                                    <option value="">Unassigned</option>
                                    {profiles.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
