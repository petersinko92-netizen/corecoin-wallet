"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { 
  Search, MessageSquare, FileText, Shield, User, 
  ChevronDown, ChevronUp, CheckCircle, 
  Zap, CreditCard, Lock, ArrowRight, X, Loader2, Send, AlertCircle
} from 'lucide-react';

// --- DATA: FAQs Categorized ---
const FAQ_DATABASE: Record<string, Array<{q: string, a: string}>> = {
  "Account": [
    { q: "How do I verify my identity (KYC)?", a: "Go to Settings > Verification. Upload a government-issued ID and take a selfie. Verification is typically instant but can take up to 24 hours." },
    { q: "Why is my account locked?", a: "Accounts are locked after 5 failed login attempts for your protection. Check your email for an unlock link or wait 30 minutes." },
    { q: "How do I update my email address?", a: "For security reasons, email changes require a manual support ticket. Please submit a request using the form on this page." }
  ],
  "Trading": [
    { q: "What are the trading fees?", a: "Standard fees are 0.1% for Maker/Taker. Using Corecoin (CORE) for fees gives you a 25% discount. VIP tiers offer rates as low as 0%." },
    { q: "How do I place a Stop-Loss order?", a: "On the trade screen, switch from 'Limit' to 'Stop-Limit'. Enter your Stop price (trigger) and your Limit price (execution price)." },
    { q: "Why was my order partially filled?", a: "This happens when there isn't enough liquidity at your specific price. The remaining amount stays open until matched or cancelled." }
  ],
  "Deposits": [
    { q: "How long do deposits take?", a: "Crypto deposits depend on network confirmations (BTC ~20m, ETH ~3m, SOL ~5s). Fiat deposits via bank transfer take 1-3 business days." },
    { q: "What is the minimum deposit?", a: "The minimum deposit varies by asset. For USDT, it is 10 USDT. For Bitcoin, it is 0.0001 BTC." },
    { q: "My deposit hasn't arrived.", a: "Check the transaction on the blockchain explorer using your TXID. If it is confirmed on-chain but not in your wallet after 1 hour, contact support." }
  ],
  "Security": [
    { q: "How do I reset 2FA?", a: "If you lost access, click the 'Reset 2FA' Quick Action button above. You will need to verify your identity with a video selfie." },
    { q: "Is my crypto safe?", a: "Yes. 95% of user funds are held in offline, air-gapped cold storage vaults. We also use real-time risk monitoring to block suspicious withdrawals." },
    { q: "How do I whitelist a withdrawal address?", a: "Go to Security > Address Management. Turn on 'Whitelist Mode' to restrict withdrawals only to approved addresses." }
  ]
};

export default function SupportPage() {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState('ticket'); 
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  // Chat States
  const [chatStatus, setChatStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [chatMessages, setChatMessages] = useState<Array<{sender: 'user' | 'agent', text: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Category Filter State
  const [activeCategory, setActiveCategory] = useState<string>("Account");
  
  // Modal State
  const [activeModal, setActiveModal] = useState<{title: string, content: string} | null>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatStatus]);

  // --- HANDLERS ---

  // 1. TICKET
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus('submitting');
    setTimeout(() => {
      setTicketStatus('success');
    }, 1500);
  };

  // 2. CHAT
  const handleStartChat = () => {
    setChatStatus('connecting');
    setTimeout(() => {
      setChatStatus('active');
      setChatMessages([{ sender: 'agent', text: 'Welcome to Corecoin Support! I am your virtual assistant. How can I help you today?' }]);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Simulate Agent Reply logic
    setTimeout(() => {
      let reply = "I understand. An agent will review your account details shortly.";
      if (userMsg.toLowerCase().includes('deposit')) reply = "Deposit times vary by network. Have you checked your TXID on the block explorer?";
      if (userMsg.toLowerCase().includes('2fa')) reply = "For security reasons, 2FA resets must be done via the 'Reset 2FA' tool in the dashboard.";
      if (userMsg.toLowerCase().includes('fee')) reply = "Our standard trading fee is 0.1%. You can lower this by holding CORE tokens.";
      
      setChatMessages(prev => [...prev, { sender: 'agent', text: reply }]);
    }, 1000);
  };

  // 3. QUICK ACTIONS
  const openAction = (action: string) => {
    const actions: any = {
      'Reset 2FA': { title: 'Reset 2FA', content: 'To reset your 2FA, please log in and go to Security Settings. If you are locked out, submit a ticket with the subject "2FA Recovery" and attach a selfie holding your ID.' },
      'Deposit Issues': { title: 'Deposit Not Arriving?', content: 'Crypto deposits require network confirmations. Bitcoin needs 2 confirmations (~20 mins). Ethereum needs 12. If it has been over 1 hour, please submit a ticket with your TXID.' },
      'Unlock Account': { title: 'Unlock Account', content: 'For security reasons, accounts are locked after 5 failed login attempts. Please check your email for an unlock link, or wait 30 minutes and try again.' },
      'Tax Documents': { title: 'Tax Center', content: 'You can download your full transaction history (CSV) from the "History" tab in your dashboard. This file is compatible with Koinly and CoinTracker.' }
    };
    setActiveModal(actions[action]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      <Navbar />
      
      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 px-6 bg-[#0a0a0a] border-b border-white/5">
         <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">All Systems Operational</span>
         </div>

         <div className="max-w-3xl mx-auto text-center mt-8">
            <h1 className="text-3xl md:text-5xl font-black mb-6">Corecoin Support</h1>
            <div className="relative w-full max-w-xl mx-auto">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
               <input 
                 type="text" 
                 placeholder="Search issues..." 
                 className="w-full h-14 rounded-xl bg-[#050505] border border-white/10 pl-14 pr-6 text-base focus:outline-none focus:border-emerald-500 transition-colors shadow-xl text-white" 
               />
            </div>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16">
         
         {/* QUICK ACTIONS (Clickable) */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <QuickAction icon={<Lock />} title="Reset 2FA" onClick={() => openAction('Reset 2FA')} />
            <QuickAction icon={<CreditCard />} title="Deposit Issues" onClick={() => openAction('Deposit Issues')} />
            <QuickAction icon={<User />} title="Unlock Account" onClick={() => openAction('Unlock Account')} />
            <QuickAction icon={<FileText />} title="Tax Documents" onClick={() => openAction('Tax Documents')} />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* LEFT COL: CATEGORIES & FAQS */}
            <div className="lg:col-span-2 space-y-12">
               
               {/* CATEGORY SELECTOR (NOW FUNCTIONAL) */}
               <div>
                  <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <CategoryCard 
                        isActive={activeCategory === 'Account'}
                        onClick={() => setActiveCategory('Account')}
                        icon={<User className={activeCategory === 'Account' ? "text-black" : "text-blue-500"}/>} 
                        title="Account & Verification" 
                        desc="KYC, Login, Security" 
                     />
                     <CategoryCard 
                        isActive={activeCategory === 'Trading'}
                        onClick={() => setActiveCategory('Trading')}
                        icon={<Zap className={activeCategory === 'Trading' ? "text-black" : "text-yellow-500"}/>} 
                        title="Spot Trading" 
                        desc="Orders, Fees, Interface" 
                     />
                     <CategoryCard 
                        isActive={activeCategory === 'Deposits'}
                        onClick={() => setActiveCategory('Deposits')}
                        icon={<CreditCard className={activeCategory === 'Deposits' ? "text-black" : "text-emerald-500"}/>} 
                        title="Deposits & Withdrawals" 
                        desc="Fiat & Crypto Limits" 
                     />
                     <CategoryCard 
                        isActive={activeCategory === 'Security'}
                        onClick={() => setActiveCategory('Security')}
                        icon={<Shield className={activeCategory === 'Security' ? "text-black" : "text-purple-500"}/>} 
                        title="Security & API" 
                        desc="2FA, Whitelisting" 
                     />
                  </div>
               </div>

               {/* DYNAMIC FAQ LIST (Filters based on selection) */}
               <div className="animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                     {activeCategory} Questions
                     <span className="text-xs font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{FAQ_DATABASE[activeCategory].length} articles</span>
                  </h2>
                  <div className="space-y-4">
                     {FAQ_DATABASE[activeCategory].map((faq, i) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} />
                     ))}
                  </div>
               </div>

            </div>

            {/* RIGHT COL: INTERACTIVE WIDGET */}
            <div className="lg:col-span-1">
               <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 sticky top-28 h-[600px] flex flex-col">
                  
                  {/* TABS */}
                  <div className="flex bg-black/50 p-1 rounded-xl mb-6 shrink-0">
                     <button onClick={() => { setActiveTab('ticket'); setTicketStatus('idle'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'ticket' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Submit Ticket</button>
                     <button onClick={() => { setActiveTab('chat'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'chat' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Live Chat</button>
                  </div>

                  {/* TAB 1: TICKET FORM */}
                  {activeTab === 'ticket' && (
                     <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {ticketStatus === 'success' ? (
                           <div className="h-full flex flex-col items-center justify-center text-center">
                              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                                 <CheckCircle size={32} />
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">Ticket Sent!</h3>
                              <p className="text-sm text-zinc-400 mb-6">We'll email you shortly. Ticket <span className="text-white font-mono">#9921</span></p>
                              <button onClick={() => setTicketStatus('idle')} className="text-sm font-bold text-emerald-500 hover:underline">New Ticket</button>
                           </div>
                        ) : (
                           <form onSubmit={handleSubmitTicket} className="flex-1 flex flex-col gap-4">
                              <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Your Email</label>
                                 <input required type="email" placeholder="john@example.com" className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none text-white" />
                              </div>
                              <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Issue</label>
                                 <select className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none text-white">
                                    <option>Deposit</option>
                                    <option>Withdrawal</option>
                                    <option>Security</option>
                                    <option>Other</option>
                                 </select>
                              </div>
                              <div className="flex-1">
                                 <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Description</label>
                                 <textarea required className="w-full h-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none text-white resize-none" placeholder="Describe your issue..."></textarea>
                              </div>
                              <button disabled={ticketStatus === 'submitting'} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                                 {ticketStatus === 'submitting' ? <><Loader2 className="animate-spin" size={18} /> Sending...</> : 'Submit Request'}
                              </button>
                           </form>
                        )}
                     </div>
                  )}

                  {/* TAB 2: LIVE CHAT (Custom Implementation) */}
                  {activeTab === 'chat' && (
                     <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {chatStatus === 'idle' && (
                           <div className="h-full flex flex-col items-center justify-center text-center">
                              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                                 <MessageSquare size={32} />
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
                              <p className="text-sm text-zinc-400 mb-6">Average wait: <span className="text-emerald-500 font-bold">~1 min</span></p>
                              <button onClick={handleStartChat} className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors">Start Chat</button>
                           </div>
                        )}
                        
                        {chatStatus === 'connecting' && (
                           <div className="h-full flex flex-col items-center justify-center text-center">
                              <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                              <h3 className="text-lg font-bold text-white">Connecting...</h3>
                           </div>
                        )}

                        {chatStatus === 'active' && (
                           <div className="flex-1 flex flex-col h-full">
                              {/* Chat History */}
                              <div className="flex-1 overflow-y-auto space-y-3 p-2 mb-3 bg-[#050505] border border-white/5 rounded-xl">
                                 {chatMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                       <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-200'}`}>
                                          {msg.text}
                                       </div>
                                    </div>
                                 ))}
                                 <div ref={chatEndRef} />
                              </div>
                              {/* Input Area */}
                              <form onSubmit={handleSendMessage} className="flex gap-2">
                                 <input 
                                   value={chatInput}
                                   onChange={(e) => setChatInput(e.target.value)}
                                   type="text" 
                                   placeholder="Type message..." 
                                   className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-3 text-sm focus:border-emerald-500 outline-none text-white" 
                                   autoFocus
                                 />
                                 <button type="submit" className="p-2 bg-white text-black rounded-lg hover:bg-zinc-200"><Send size={18} /></button>
                              </form>
                           </div>
                        )}
                     </div>
                  )}

               </div>
               
               {/* VIP Contact */}
               <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-transparent border border-white/5">
                  <h4 className="font-bold text-white mb-2">Institutional Client?</h4>
                  <p className="text-sm text-zinc-400 mb-4">VIPs get dedicated account managers.</p>
                  <button className="text-sm text-emerald-500 font-bold hover:underline flex items-center gap-1">
                     Contact VIP Desk <ArrowRight size={14} />
                  </button>
               </div>
            </div>

         </div>
      </main>

      {/* MODAL */}
      {activeModal && (
         <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
               <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-emerald-500"/> {activeModal.title}
               </h3>
               <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                  {activeModal.content}
               </p>
               <button onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200">
                  Got it
               </button>
            </div>
         </div>
      )}

      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function QuickAction({ icon, title, onClick }: any) {
  return (
    <div onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-zinc-800 hover:border-white/10 cursor-pointer transition-all group active:scale-95">
      <div className="text-zinc-500 group-hover:text-emerald-500 group-hover:scale-110 transition-all mb-3">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase tracking-wide text-center">{title}</span>
    </div>
  );
}

function CategoryCard({ icon, title, desc, isActive, onClick }: any) {
   return (
      <div 
        onClick={onClick}
        className={`flex items-start gap-4 p-5 border rounded-2xl transition-all cursor-pointer group ${
           isActive 
             ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
             : 'bg-zinc-900/30 border-white/5 hover:border-white/20 hover:bg-zinc-900'
        }`}
      >
         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
            isActive ? 'bg-black text-emerald-500' : 'bg-white/5'
         }`}>
            {icon}
         </div>
         <div>
            <h3 className={`font-bold text-sm mb-1 ${isActive ? 'text-black' : 'text-white'}`}>{title}</h3>
            <p className={`text-xs ${isActive ? 'text-black/70' : 'text-zinc-500'}`}>{desc}</p>
         </div>
      </div>
   );
}

function FAQItem({ q, a }: { q: string, a: string }) {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div className="border border-white/5 rounded-xl bg-zinc-900/20 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
         <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-5 text-left hover:bg-white/5 transition-colors">
            <span className="font-bold text-zinc-200">{q}</span>
            {isOpen ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
         </button>
         <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-white/5 mt-2">{a}</div>
         </div>
      </div>
   );
}