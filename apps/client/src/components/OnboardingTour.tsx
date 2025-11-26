/**
 * Onboarding Tour Component
 * First-time user experience with guided tour
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ArrowRight, ArrowLeft, Sparkles, Workflow, Bot, 
  Zap, CheckCircle2, Rocket, Shield, Cloud
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: string;
  highlight?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Taktak! 🎉',
    description: 'Your AI-powered automation platform with 99.9% uptime. Let\'s take a quick tour to get you started.',
    icon: Sparkles,
  },
  {
    id: 'workflows',
    title: 'Create Workflows',
    description: 'Build powerful automations with our visual drag-and-drop editor. Connect apps, add logic, and automate anything.',
    icon: Workflow,
    highlight: 'workflows',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Describe what you want to automate in plain English, and our AI will build the workflow for you.',
    icon: Bot,
    highlight: 'ai-assistant',
  },
  {
    id: 'failover',
    title: '4-Tier AI Failover',
    description: 'Unlike other platforms, Taktak never fails. Our intelligent failover ensures your automations run 24/7, even offline.',
    icon: Shield,
  },
  {
    id: 'offline',
    title: 'Works Offline',
    description: 'Create and edit workflows without internet. Everything syncs automatically when you\'re back online.',
    icon: Cloud,
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Start by creating your first workflow or let AI build one for you. Happy automating!',
    icon: Rocket,
    action: 'create',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');
    onSkip();
  };

  const handleAction = () => {
    if (step.action === 'create') {
      handleComplete();
      navigate('/app/workflows/new');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 animate-fade-in-up">
        {/* Card */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-dark-border">
            <div 
              className="h-full bg-gradient-to-r from-taktak-500 to-accent-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-taktak-500 to-accent-500 shadow-glow">
                <step.icon className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center space-x-2 mb-8">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-8 bg-taktak-500' 
                      : index < currentStep 
                        ? 'bg-taktak-500/50' 
                        : 'bg-dark-border'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={isFirstStep}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isFirstStep 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-border'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Skip Tour
                </button>
                
                {step.action ? (
                  <button
                    type="button"
                    onClick={handleAction}
                    className="btn btn-primary"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Create First Workflow
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                  >
                    {isLastStep ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute -top-2 -right-2 p-2 bg-dark-surface border border-dark-border rounded-full text-gray-400 hover:text-white hover:bg-dark-border transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Hook to check if onboarding should be shown
 */
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setShowOnboarding(true);
  };

  return { showOnboarding, completeOnboarding, resetOnboarding };
}

