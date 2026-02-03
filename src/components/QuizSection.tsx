"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

import relationshipGoalsImg from "@/assets/relationship_goals_1770109500117.png";
import datingClarityImg from "@/assets/dating_clarity_1770109515066.png";
import vettingHelpImg from "@/assets/vetting_help_1770109560462.png";
import swirlingCoupleImg from "@/assets/swriling_couple_1770109529730.png";

const questions = [
  {
    question: "What are you looking for?",
    options: [
      { label: "Serious relationship", image: relationshipGoalsImg },
      { label: "Dating clarity", image: datingClarityImg },
      { label: "Vetting help", image: vettingHelpImg },
      { label: "Swirling advice", image: swirlingCoupleImg },
    ],
  },
  {
    question: "What's your biggest dating challenge?",
    options: [
      { label: "Spotting red flags", emoji: "🚩" },
      { label: "Knowing what to say", emoji: "💬" },
      { label: "Building confidence", emoji: "💪" },
      { label: "Setting boundaries", emoji: "🛡️" },
    ],
  },
  {
    question: "What's your age range?",
    options: [
      { label: "18–24", emoji: "🌸" },
      { label: "25–34", emoji: "✨" },
      { label: "35–44", emoji: "👑" },
      { label: "45+", emoji: "💎" },
    ],
  },
  {
    question: "What's your relationship status?",
    options: [
      { label: "Single & searching", emoji: "👀" },
      { label: "Dating someone new", emoji: "🌱" },
      { label: "It's complicated", emoji: "🤷‍♀️" },
      { label: "Taking a break", emoji: "☕" },
    ],
  },
  {
    question: "What brought you here today?",
    options: [
      { label: "Need advice on a guy", emoji: "👨" },
      { label: "Want to decode a text", emoji: "📱" },
      { label: "General dating guidance", emoji: "✨" },
      { label: "Just curious", emoji: "🧐" },
    ],
  },
  {
    question: "What matters most to you in a partner?",
    options: [
      { label: "Honesty & respect", emoji: "💯" },
      { label: "Emotional availability", emoji: "💕" },
      { label: "Shared values", emoji: "🤝" },
      { label: "Growth mindset", emoji: "🌱" },
    ],
  },
];

export const QuizSection = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
      setAnswers(answers.slice(0, -1));
    }
  };

  const progress = (answers.length / questions.length) * 100;

  return (
    <section id="quiz" className="py-20 md:py-28 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream mb-4">
            Let's Get to Know You
          </h2>
          <p className="text-cream/70 text-lg max-w-2xl mx-auto">
            Just a few questions so Pinky can give you personalized advice — leads straight to chat
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/*Progress bar at top, 4px purple border */}
          <div className="mb-8">
            <div className="flex justify-between text-cream/60 text-sm mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-1 bg-plum-light rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-plum-light rounded-3xl p-8 md:p-10"
              >
                <h3 className="font-serif text-2xl md:text-3xl text-cream mb-8 text-center">
                  {questions[currentQuestion].question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {questions[currentQuestion].options.map((option: any) => (
                    <button
                      key={option.label}
                      onClick={() => handleSelect(option.label)}
                      className={`relative overflow-hidden group rounded-3xl border-2 transition-all duration-500 text-left ${selectedOption === option.label
                        ? "border-gold bg-primary/20 shadow-glow"
                        : "border-cream/10 bg-plum-light/50 hover:border-gold/30 hover:bg-plum-light/80"
                        }`}
                    >
                      {option.image ? (
                        <div className="aspect-video w-full overflow-hidden relative">
                          <Image
                            src={option.image as { src: string; width: number; height: number }}
                            alt={option.label}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={`object-cover transition-transform duration-700 ${selectedOption === option.label ? "scale-110" : "group-hover:scale-105"}`}
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-60`} />
                        </div>
                      ) : (
                        <div className="p-6 pb-2 text-4xl">{option.emoji}</div>
                      )}

                      <div className="p-6 pt-4 relative z-10">
                        <span className={`font-serif text-lg font-medium transition-colors ${selectedOption === option.label ? "text-gold" : "text-cream/90"
                          }`}>
                          {option.label}
                        </span>
                        {selectedOption === option.label && (
                          <motion.div
                            layoutId="selection-check"
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gold flex items-center justify-center"
                          >
                            <Sparkles size={12} className="text-secondary" />
                          </motion.div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentQuestion === 0}
                    className="text-cream/60 hover:text-cream"
                  >
                    <ChevronLeft size={20} />
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleNext}
                    disabled={!selectedOption}
                    size="lg"
                  >
                    {currentQuestion === questions.length - 1 ? "See Results" : "Next"}
                    <ChevronRight size={20} />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-plum-light rounded-3xl p-8 md:p-12 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cta-gradient mb-6">
                  <Sparkles size={40} className="text-primary-foreground" />
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-cream mb-4">
                  Perfect! Pinky's Ready for You
                </h3>
                <p className="text-cream/70 text-lg mb-8 max-w-md mx-auto">
                  Based on your answers, Pinky is ready to give you personalized dating advice and help you vet that man!
                </p>
                <Button variant="hero" size="xl" asChild>
                  <a href="#chatbot">Start Chatting with Pinky</a>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
