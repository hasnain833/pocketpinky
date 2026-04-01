export const FinalCTA = () => {
    const chatbotUrl = "https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2025/12/22/20/20251222201454-LHAZEGXE.json";

    return (
        <section className="py-24 px-[5%] bg-[hsl(var(--charcoal))] text-center">
            <div className="max-w-[800px] mx-auto">
                <h2 className="font-serif text-[2.75rem] text-[hsl(var(--cream))] mb-4">
                    Ready to Stop Guessing and <em className="text-[hsl(var(--pink-accent))] italic">Start Knowing</em>?
                </h2>
                <p className="text-white/70 mb-8 text-lg">
                    Your first conversation with Pinky is free. No signup, no credit card.
                </p>
                <a
                    href={chatbotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] px-9 py-4 text-sm font-semibold tracking-wide uppercase rounded-sm transition-all duration-300 hover:bg-[hsl(var(--gold-light))] hover:-translate-y-0.5"
                >
                    Talk to Pinky Now
                </a>
            </div>
        </section>
    );
};
