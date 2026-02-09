"use client";
import { useState } from "react";

export const MethodSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const items = [
        {
            title: "How does Pinky know what patterns to look for?",
            content: "Pinky is trained on 49 documented manipulation patterns identified through years of coaching thousands of women. She recognizes the subtle signs that often get rationalized away."
        },
        {
            title: "Is this just for Black women?",
            content: "While Pinky was created with Black women in mind and includes specialized IR/Swirling mode, her pattern recognition and vetting strategies work for any woman who wants dating clarity."
        },
        {
            title: "What makes Pinky different from regular dating advice?",
            content: "Pinky doesn't sugarcoat or give you what you want to hear. She gives you what you need to hear, backed by specific patterns and actionable next steps. No fluff, just clarity."
        },
        {
            title: "Can I really trust an AI with something this personal?",
            content: "Pinky isn't replacing human connection—she's giving you the objective perspective you'd get from a wise friend who isn't emotionally invested in your situation. Sometimes that distance is exactly what you need."
        }
    ];

    return (
        <section className="py-24 px-[5%] bg-white">
            <div className="max-w-[800px] mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-[2.5rem] text-[hsl(var(--charcoal))]">
                        How It Works
                    </h2>
                </div>

                <div className="space-y-0">
                    {items.map((item, index) => (
                        <div key={index} className="border-b border-[hsl(var(--divider))]">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full py-6 flex justify-between items-center font-serif text-[1.35rem] text-[hsl(var(--charcoal))] hover:text-[hsl(var(--pink-accent))] transition-colors text-left"
                            >
                                {item.title}
                                <span className={`text-2xl text-[hsl(var(--gold))] transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}>
                                    +
                                </span>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                                    }`}
                            >
                                <p className="text-[0.95rem] text-[hsl(var(--text-secondary))] leading-[1.8]">
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
