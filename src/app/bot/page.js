'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { cn, BOT_ADD_URL } from '@/lib/utils';
import { Terminal, MessageSquare, Zap, Copy, Check, Bot, History, GitCommit, Plus, LayoutDashboard } from 'lucide-react';

export default function BotPage() {
    const [copied, setCopied] = useState(null);
    const [activeSection, setActiveSection] = useState("changelog");
    const [commands, setCommands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    const latestChangelog = {
        version: "v2.0.0",
        id: "changelog",
        date: "January 17, 2026",
        changes: [
            'Added Max Payne 3 to native database.',
            'Added Grand Theft Auto IV to native database.',
            'Fixed a critical bug in the native commands that could cause the bot to crash.',
            'Inlined embed creation for `native-namespace` and `native-random` to prevent module caching issues.',
            'Added a new `changelogs` command to display the latest updates.',
            'Minor performance improvements and code refactoring.'
        ]
    };

    useEffect(() => {
        const fetchCommands = async () => {
            try {
                const response = await fetch('/api/bot/commands');
                if (!response.ok) throw new Error('Failed to fetch commands');
                const data = await response.json();

                const iconMap = {
                    general: <MessageSquare className="w-5 h-5" />,
                    natives: <Terminal className="w-5 h-5" />,
                    favorites: <Zap className="w-5 h-5" />,
                    utility: <LayoutDashboard className="w-5 h-5" />,
                };

                const formattedCommands = data.map(section => ({
                    ...section,
                    icon: iconMap[section.id] || <Terminal className="w-5 h-5" />
                }));

                setCommands(formattedCommands);
            } catch (error) {
                console.error("Failed to fetch commands:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCommands();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background overflow-hidden">
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-72 border-r border-border bg-surface/30 hidden lg:flex flex-col overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <a
                            href={BOT_ADD_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            <span>Add on your server</span>
                        </a>

                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">Menu</h3>
                            <button
                                onClick={() => setActiveSection("changelog")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                                    activeSection === "changelog"
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                                )}
                            >
                                <History className="w-4 h-4" />
                                Latest Updates
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">Categories</h3>
                            {commands.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                                        activeSection === section.id
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                                    )}
                                >
                                    {section.icon}
                                    {section.category}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-6 py-12 max-w-5xl space-y-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
                                <Bot size={48} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gradient">Bot Commands</h1>
                            <p className="text-muted text-lg max-w-2xl">
                                Enhance your development workflow with our Discord bot.
                                Below is a complete reference of all available commands.
                            </p>
                        </div>

                        {activeSection === "changelog" && (
                            <div className="glass rounded-xl border border-border overflow-hidden">
                                <div className="p-6 border-b border-border bg-surface/50 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Latest Updates</h2>
                                        <p className="text-xs text-muted font-mono mt-1">
                                            <span className="text-primary">{latestChangelog.version}</span> • {latestChangelog.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 bg-surface/30">
                                    <ul className="space-y-3">
                                        {latestChangelog.changes.map((change, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <GitCommit className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                <span>{change}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-8">
                            {commands.map((section, idx) => {
                                if (activeSection !== section.id) return null;
                                return (
                                    <div key={idx} className="glass rounded-xl border border-border overflow-hidden">
                                        <div className="p-6 border-b border-border bg-surface/50 flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                {section.icon}
                                            </div>
                                            <h2 className="text-xl font-bold text-foreground">{section.category}</h2>
                                        </div>

                                        <div className="divide-y divide-border/50">
                                            {section.items.map((cmd, cmdIdx) => (
                                                <div key={cmdIdx} className="p-6 hover:bg-surface/30 transition-colors group">
                                                    <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                                                        <div className="space-y-2 flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <code className="text-primary font-mono font-bold bg-primary/10 px-2 py-1 rounded text-sm">
                                                                    {cmd.name}
                                                                </code>
                                                            </div>
                                                            <p className="text-muted text-sm leading-relaxed">{cmd.description}</p>
                                                        </div>

                                                        <div className="relative bg-black/20 rounded-lg p-3 font-mono text-sm text-muted-foreground whitespace-nowrap min-w-[240px] group-hover:bg-black/30 transition-colors">
                                                            <div className="text-[10px] uppercase tracking-wider text-muted mb-1 opacity-50 font-bold">Usage</div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span>{cmd.usage}</span>
                                                                <button
                                                                    onClick={() => handleCopy(cmd.usage)}
                                                                    className="text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="Copy usage"
                                                                >
                                                                    {copied === cmd.usage ? <Check size={14} /> : <Copy size={14} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}