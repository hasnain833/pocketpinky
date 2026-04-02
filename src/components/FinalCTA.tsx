"use client";

export const FinalCTA = () => {
    return (
        <section className="py-24 px-[5%] bg-[hsl(var(--charcoal))] text-center">
            <div className="max-w-[800px] mx-auto">
                <h2 className="font-serif text-[2.75rem] text-[hsl(var(--cream))] mb-4">
                    Ready to Stop Guessing and <em className="text-[hsl(var(--pink-accent))] italic">Start Knowing</em>?
                </h2>
                <p className="text-white/70 mb-8 text-lg">
                    Your first conversation with Pinky is free. No signup, no credit card.
                </p>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-pinky-chat'))}
                    className="inline-block bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] px-9 py-4 text-sm font-semibold tracking-wide uppercase rounded-sm transition-all duration-300 hover:bg-[hsl(var(--gold-light))] hover:-translate-y-0.5"
                >
                    Talk to Pinky Now
                </button>
            </div>
        </section>
    );
};
