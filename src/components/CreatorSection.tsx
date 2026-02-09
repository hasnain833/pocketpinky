export const CreatorSection = () => {
    return (
        <section className="py-24 px-[5%] bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 max-w-[1100px] mx-auto items-center">
                {/* Left - Image */}
                <div className="flex justify-center lg:block relative">
                    <div className="w-full max-w-[420px] aspect-[3/4] bg-gradient-to-br from-[hsl(var(--pink-soft))] to-[hsl(var(--gold-pale))] rounded shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex items-center justify-center text-[hsl(var(--text-secondary))] text-sm">
                        Creator Image
                    </div>
                </div>

                {/* Right - Content */}
                <div className="max-w-[500px] mx-auto lg:mx-0 text-center lg:text-left">
                    <div className="text-xs font-semibold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-4">
                        Meet the Creator
                    </div>
                    <h2 className="font-serif text-[2.5rem] text-[hsl(var(--charcoal))] mb-6">
                        Christelyn Karazin
                    </h2>
                    <p className="text-base text-[hsl(var(--text-secondary))] mb-5 leading-[1.8]">
                        Co-author of the groundbreaking book "Swirling" and creator of the Pink Pill philosophy.
                    </p>
                    <p className="text-base text-[hsl(var(--text-secondary))] mb-5 leading-[1.8]">
                        With over a decade of coaching experience and a community of 100K+ women, Christelyn has helped thousands recognize manipulation patterns and build the relationships they deserve.
                    </p>
                    <p className="text-base text-[hsl(var(--text-secondary))] mb-8 leading-[1.8]">
                        Pinky is the AI embodiment of her direct, compassionate approach to dating clarity.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        <span className="text-xs font-medium px-4 py-2 bg-[hsl(var(--gold-pale))] text-[hsl(var(--charcoal))] rounded-sm">
                            Co-author, Swirling
                        </span>
                        <span className="text-xs font-medium px-4 py-2 bg-[hsl(var(--cream))] text-[hsl(var(--text-secondary))] rounded-sm">
                            10+ Years Coaching
                        </span>
                        <span className="text-xs font-medium px-4 py-2 bg-[hsl(var(--cream))] text-[hsl(var(--text-secondary))] rounded-sm">
                            100K+ Community
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
