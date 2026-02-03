"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

export const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const testimonials = [
    {
      name: "Jasmine T.",
      quote: "Pinky helped me see what I was ignoring for months. She called out his patterns and I finally had the clarity to walk away. Best decision ever.",
      rating: 5,
    },
    {
      name: "Diamond R.",
      quote: "I used to overthink every text. Now I just ask Pinky and she gives it to me straight. My anxiety around dating has dropped so much.",
      rating: 5,
    },
    {
      name: "Keisha M.",
      quote: "The vetting feature is EVERYTHING. Pinky spotted red flags I didn't even know were red flags. My standards are non-negotiable now.",
      rating: 5,
    },
    {
      name: "Nia W.",
      quote: "As someone navigating interracial dating, the Swirl Mode has been invaluable. Pinky gets it and gives advice that actually makes sense.",
      rating: 5,
    },
    {
      name: "Taylor B.",
      quote: "Pinky is like the big sister I never had. Real talk with love. She helped me set boundaries I should've set years ago.",
      rating: 5,
    },
  ];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const nextStep = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevStep = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) nextStep();
    else if (distance < -minSwipeDistance) prevStep();
  };

  useEffect(() => {
    const timer = setInterval(nextStep, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-cream overflow-hidden relative">
      {/* Decorative background curve */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-secondary rounded-b-[100%] opacity-5 -z-10" />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block font-script text-3xl md:text-4xl text-primary mb-4 drop-shadow-sm">
            Real Stories, Real Clarity
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-secondary mb-6 tracking-tight">
            Loved by <span className="italic text-primary">Thousands of Queens</span>
          </h2>
        </motion.div>

        {/* Carousel: one card at a time; on mobile swipe to change, no buttons; on desktop arrows + dots */}
        <div
          className="relative max-w-4xl mx-auto min-h-[420px] md:min-h-0 md:h-[400px] touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              <div className="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-primary/5 h-full flex flex-col justify-center items-center text-center relative group">
                <Quote className="absolute top-6 left-6 md:top-10 md:left-10 text-primary/10 w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 -z-0" />

                <div className="flex gap-1 mb-5 md:mb-8 relative z-10">
                  {[...Array(testimonials[index].rating)].map((_, i) => (
                    <Star key={i} size={20} className="fill-[#FF6B6B] text-[#FF6B6B] drop-shadow-sm" />
                  ))}
                </div>

                <p className="font-serif text-base md:text-xl lg:text-2xl xl:text-3xl text-secondary/90 leading-relaxed mb-6 md:mb-10 italic max-w-2xl relative z-10 px-1">
                  "{testimonials[index].quote}"
                </p>

                <div className="flex flex-col items-center gap-2 md:gap-3 relative z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-cta-gradient flex items-center justify-center text-white font-bold text-lg md:text-2xl shadow-lg shadow-primary/20">
                    {testimonials[index].name.charAt(0)}
                  </div>
                  <h4 className="font-serif text-base md:text-xl text-secondary font-bold">
                    {testimonials[index].name}
                  </h4>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - desktop only */}
          <button
            type="button"
            onClick={prevStep}
            className="hidden md:flex absolute -left-20 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white shadow-xl text-secondary hover:text-primary transition-all hover:scale-110 z-20"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="hidden md:flex absolute -right-20 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white shadow-xl text-secondary hover:text-primary transition-all hover:scale-110 z-20"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots - desktop only */}
        <div className="hidden md:flex justify-center gap-3 mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${i === index ? "bg-primary w-8" : "bg-primary/20 hover:bg-primary/40"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
