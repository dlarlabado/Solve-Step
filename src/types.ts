export interface Concept {
  title: string;
  description: string;
  formulaLatex: string;
  whyItApplies?: string;
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathLatex: string;
  keyInsight?: string;
}

export interface FinalAnswer {
  latex: string;
  text: string;
  units?: string;
}

export interface SolutionData {
  detectedText: string;
  subject: "Math" | "Physics" | string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Olympiad" | string;
  summary: string;
  concepts: Concept[];
  steps: SolutionStep[];
  finalAnswer: FinalAnswer;
  commonPitfalls?: string[];
  constantsUsed?: string[];
  verificationCheck?: string;
}

export interface PracticeStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathLatex: string;
}

export interface PracticeProblemData {
  problemStatement: string;
  topic?: string;
  difficulty?: string;
  hint: string;
  steps: PracticeStep[];
  finalAnswer: {
    latex: string;
    text: string;
  };
  keyTakeaway?: string;
}

export interface SampleProblem {
  id: string;
  title: string;
  subject: "Math" | "Physics";
  topic: string;
  badge: string;
  description: string;
  previewLatex: string;
  textPrompt: string;
  imageUrl?: string;
  svgIconName?: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  title: string;
  subject: string;
  topic: string;
  imagePreview?: string;
  solution: SolutionData;
}
