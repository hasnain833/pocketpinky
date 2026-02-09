export const WhoSection = () => {
    const items = [
        {
            icon: "🔄",
            text: "You've excused red flags before and paid for it — now you want to catch them early."
        },
        {
            icon: "💬",
            text: "You're tired of decoding texts at 2am wondering what he really meant."
        },
        {
            icon: "👑",
            text: "You know your worth but need backup when emotions cloud your judgment."
        },
        {
            icon: "🍦",
            text: "You're dating interracially and need someone who gets the nuances."
        }
    ];

    return (
        <section className="py-24 px-[5%] bg-white">
            <div className="max-w-[900px] mx-auto text-center">
                <div className="text-xs font-semibold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-6">
                    Who This Is For
                </div>
                <h2 className="font-serif text-[2.75rem] text-[hsl(var(--charcoal))] mb-12">
                    Women Who Are Done With Confusion
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-12">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-4 p-6 bg-[hsl(var(--cream))] rounded">
                            <div className="w-10 h-10 bg-[hsl(var(--gold-pale))] rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                                {item.icon}
                            </div>
                            <p className="text-[0.95rem] text-[hsl(var(--text-primary))] leading-[1.6]">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
