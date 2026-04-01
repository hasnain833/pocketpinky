export const ModesSection = () => {
    const chatbotUrl = "https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2025/12/22/20/20251222201454-LHAZEGXE.json";

    const modes = [
        { icon: "🔍", title: "Vet Him", description: "Get a verdict on the man in front of you", tag: "Vetting", tagColor: "bg-[hsl(var(--blush))] text-[hsl(var(--pink-deep))]" },
        { icon: "💬", title: "Decode His Texts", description: "See what his messages really mean", tag: "Vetting", tagColor: "bg-[hsl(var(--blush))] text-[hsl(var(--pink-deep))]" },
        { icon: "📋", title: "Him Report", description: "Flags, score, verdict, next step — all in one", tag: "Vetting", tagColor: "bg-[hsl(var(--blush))] text-[hsl(var(--pink-deep))]" },
        { icon: "✨", title: "Script Me", description: "Copy-paste scripts that protect your standards", tag: "Coaching", tagColor: "bg-[hsl(var(--gold-pale))] text-[hsl(var(--gold))]" },
        { icon: "👑", title: "HVM Mode", description: "Where to meet and attract high-value men", tag: "Coaching", tagColor: "bg-[hsl(var(--gold-pale))] text-[hsl(var(--gold))]" },
        { icon: "🍦", title: "Swirling Mode", description: "IR-specific vetting that screens for real interest", tag: "IR Expertise", tagColor: "bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))]", featured: true },
        { icon: "📚", title: "49 Pattern Library", description: "Name the game he's playing in seconds", tag: "Education", tagColor: "bg-[hsl(var(--cream-dark))] text-[hsl(var(--text-secondary))]" }
    ];

    return (
        <section id="modes" className="py-24 px-[5%] bg-[hsl(var(--cream))]">
            <div className="max-w-[600px] mx-auto text-center mb-16">
                <div className="text-xs font-semibold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-4">
                    Choose Your Mode
                </div>
                <h2 className="font-serif text-[2.75rem] text-[hsl(var(--charcoal))] mb-4">
                    What Pinky Can Do For You
                </h2>
                <p className="text-[hsl(var(--text-secondary))] text-base">
                    Every mode gives you clarity, education, and a clear next step.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
                {modes.map((mode, index) => (
                    <a
                        key={index}
                        href={chatbotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`bg-white p-8 rounded transition-all duration-300 border ${mode.featured
                            ? 'border-2 border-[hsl(var(--gold))] bg-[hsl(var(--gold-pale))]'
                            : 'border-[hsl(var(--divider))] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-[hsl(var(--pink-soft))]'
                            }`}
                    >
                        <div className="text-3xl mb-4">{mode.icon}</div>
                        <h3 className="font-serif text-[1.35rem] text-[hsl(var(--charcoal))] mb-2">{mode.title}</h3>
                        <p className="text-sm text-[hsl(var(--text-secondary))] leading-[1.5] mb-4">{mode.description}</p>
                        <span className={`inline-block text-[0.65rem] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-sm ${mode.tagColor}`}>
                            {mode.tag}
                        </span>
                    </a>
                ))}
            </div>
        </section>
    );
};
