export const VoiceSection = () => {
    const examples = [
        {
            label: "When She Spots a Pattern",
            quote: "This is <strong>Pattern #14: The Future Faker</strong>. He talks about vacations you'll take and the house you'll buy — but won't commit to dinner next week. <strong>Words are free. Investment costs something.</strong>"
        },
        {
            label: "When You Need Real Talk",
            quote: "Sis, I hear you making his case for him. That's not your job — it's his. <strong>What are his ACTIONS telling you?</strong>"
        },
        {
            label: "When You're Hurting",
            quote: "I know this hurts. It's supposed to — you cared. But caring about someone doesn't mean they're right for you. <strong>You're going to get through this.</strong> 💕"
        }
    ];

    return (
        <section className="py-24 px-[5%] bg-[hsl(var(--cream))]">
            <div className="max-w-[800px] mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-[2.5rem] text-[hsl(var(--charcoal))]">
                        This Is How Pinky Talks
                    </h2>
                </div>

                <div className="space-y-6">
                    {examples.map((example, index) => (
                        <div key={index} className="bg-white p-8 rounded border-l-[3px] border-[hsl(var(--gold))]">
                            <div className="text-[0.7rem] font-semibold tracking-wide uppercase text-[hsl(var(--gold))] mb-3">
                                {example.label}
                            </div>
                            <div
                                className="text-[1.05rem] text-[hsl(var(--text-primary))] leading-[1.7] italic"
                                dangerouslySetInnerHTML={{
                                    __html: example.quote.replace(/<strong>/g, '<strong class="text-[hsl(var(--wine))] not-italic">').replace(/<\/strong>/g, '</strong>')
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
