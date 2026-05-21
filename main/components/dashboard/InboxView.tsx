
import React, { useContext, useState } from 'react';
import { AppContext } from './context/AppContext';
import type { Email } from '../../types';

export const InboxView: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'Primary' | 'Social' | 'Promotions'>('Social'); // Default to Social as requested
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

    if (!context) return null;

    const filteredEmails = context.inbox.filter(email => email.category === activeTab).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const handleEmailClick = (email: Email) => {
        setSelectedEmail(email);
        context.markAsRead(email.id);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        context.deleteEmail(id);
        if (selectedEmail?.id === id) setSelectedEmail(null);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="h-full flex flex-col animate-fade-in">
             <h1 className="text-3xl font-bold font-heading text-text mb-6">Inbox</h1>
            <div className="bg-surface border border-subtle rounded-2xl shadow-sm flex flex-col md:flex-row h-[600px] overflow-hidden">
                
                {/* Email List */}
                <div className={`md:w-5/12 border-r border-subtle flex flex-col ${selectedEmail ? 'hidden md:flex' : 'w-full'}`}>
                    {/* Tabs */}
                    <div className="flex border-b border-subtle bg-white/40">
                         {(['Primary', 'Social', 'Promotions'] as const).map(tab => {
                             const isActive = activeTab === tab;
                             const count = context.inbox.filter(e => e.category === tab && !e.read).length;
                             return (
                                <button 
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setSelectedEmail(null); }}
                                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors relative ${isActive ? 'border-primary text-primary bg-white/60' : 'border-transparent text-text-muted hover:bg-white/40'}`}
                                >
                                    {tab === 'Social' && (
                                        <span className="mr-2 text-blue-500">
                                            <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        </span>
                                    )}
                                    {tab}
                                    {count > 0 && <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 rounded-full">{count}</span>}
                                </button>
                             );
                         })}
                    </div>

                    {/* Search / Toolbar */}
                    <div className="p-3 border-b border-subtle bg-white/20">
                        <input type="text" placeholder="Search mail" className="w-full bg-white/60 border border-subtle rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredEmails.length === 0 ? (
                            <div className="text-center py-10 text-text-muted text-sm">
                                <p>No emails in {activeTab}.</p>
                                <p className="text-xs mt-2 opacity-60">Automatic alerts will appear here.</p>
                            </div>
                        ) : (
                            filteredEmails.map(email => (
                                <div 
                                    key={email.id}
                                    onClick={() => handleEmailClick(email)}
                                    className={`p-4 border-b border-subtle cursor-pointer transition-colors hover:bg-white/60 ${selectedEmail?.id === email.id ? 'bg-primary/5' : email.read ? 'opacity-80' : 'bg-white/40 border-l-4 border-l-primary'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm truncate pr-2 ${email.read ? 'font-medium' : 'font-bold text-text'}`}>{email.sender}</h4>
                                        <span className="text-[10px] text-text-muted whitespace-nowrap">{formatDate(email.timestamp)}</span>
                                    </div>
                                    <h5 className={`text-sm mb-1 truncate ${email.read ? 'text-text' : 'font-bold text-text'}`}>{email.subject}</h5>
                                    <p className="text-xs text-text-muted line-clamp-2">{email.body}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Email Detail */}
                <div className={`md:w-7/12 bg-white/30 flex flex-col ${selectedEmail ? 'w-full' : 'hidden md:flex'}`}>
                    {selectedEmail ? (
                        <>
                            <div className="p-6 border-b border-subtle flex justify-between items-start bg-white/50 backdrop-blur-sm">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <button onClick={() => setSelectedEmail(null)} className="md:hidden mr-3 text-text-muted">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <h2 className="text-xl font-bold font-heading text-text">{selectedEmail.subject}</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {selectedEmail.sender[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text">{selectedEmail.sender} <span className="text-xs font-normal text-text-muted">&lt;system@aq-app.com&gt;</span></p>
                                            <p className="text-xs text-text-muted">to me</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-xs text-text-muted mt-1">{formatDate(selectedEmail.timestamp)}</span>
                                    <button onClick={(e) => handleDelete(e, selectedEmail.id)} className="text-text-muted hover:text-rose-500 p-1">
                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 flex-1 overflow-y-auto whitespace-pre-wrap text-text leading-relaxed font-sans">
                                {selectedEmail.body}
                                
                                <div className="mt-8 pt-8 border-t border-subtle">
                                    <button className="px-4 py-2 border border-subtle rounded-lg text-sm font-medium text-text-muted hover:bg-white transition-colors">
                                        Reply
                                    </button>
                                    <button className="ml-2 px-4 py-2 border border-subtle rounded-lg text-sm font-medium text-text-muted hover:bg-white transition-colors">
                                        Forward
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
                            <svg className="w-16 h-16 mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                            <p>Select an email to read</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
