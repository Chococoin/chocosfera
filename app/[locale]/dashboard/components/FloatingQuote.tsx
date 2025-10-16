'use client';

import { useEffect, useState } from 'react';

const chocolateQuotes = [
  'Chocolate is happiness you can eat',
  'Life is like a box of chocolates, full of sweet surprises',
  'All you need is love... and chocolate',
  'Chocolate doesn\'t ask silly questions, chocolate understands',
  'There is nothing better than a friend, unless it is a friend with chocolate',
  'Chocolate is nature\'s way of making up for Mondays',
  'Forget love, I\'d rather fall in chocolate',
  'Chocolate is the answer, who cares what the question is',
  'Save the Earth, it\'s the only planet with chocolate',
  'Chocolate: because adulting is hard',
  'Life happens, chocolate helps',
  'Money can\'t buy happiness, but it can buy chocolate',
  'Stressed spelled backwards is desserts... coincidence?',
  'Keep calm and eat chocolate',
  'A balanced diet is chocolate in both hands',
];

export function FloatingQuote() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');

  // Get random quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * chocolateQuotes.length);
    return chocolateQuotes[randomIndex];
  };

  useEffect(() => {
    // Set initial quote
    setCurrentQuote(getRandomQuote());

    // Check if we should show quote immediately (after logout)
    const shouldShowImmediately = sessionStorage.getItem('showQuoteOnLoad');
    if (shouldShowImmediately) {
      sessionStorage.removeItem('showQuoteOnLoad');
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }

    // Show quote every hour (3600000 milliseconds)
    const interval = setInterval(() => {
      setCurrentQuote(getRandomQuote());
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 5000); // Visible for 5 seconds
    }, 3600000); // Every hour

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="surface-panel px-6 py-3 shadow-lg backdrop-blur-lg border border-[var(--color-border)]">
        <p className="text-sm text-muted italic flex items-center gap-2">
          <span className="text-xl">🍫</span>
          &ldquo;{currentQuote}&rdquo;
        </p>
      </div>
    </div>
  );
}
