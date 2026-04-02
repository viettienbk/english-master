import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PhonemeResult {
  phoneme: string;
  correct: boolean;
  recognizedAs?: string;
  label?: string;
}

export interface WordScore {
  word: string;
  accuracyScore: number;
  errorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
  phonemes: PhonemeResult[];
  feedback?: string; // Vietnamese explanation from Gemini
}

export interface PronunciationAssessmentResult {
  transcript: string;
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  words: WordScore[];
}

const ASSESSMENT_PROMPT = (referenceText: string) => `
You are an English pronunciation assessment system for Vietnamese learners.

The learner is trying to say: "${referenceText}"

Listen to the audio carefully, then respond with ONLY a JSON object in this exact format:
{
  "transcript": "<what was actually said>",
  "overallScore": <0-100>,
  "accuracyScore": <0-100>,
  "fluencyScore": <0-100>,
  "completenessScore": <0-100>,
  "words": [
    {
      "word": "<target word from the reference text>",
      "accuracyScore": <0-100>,
      "errorType": "<None|Mispronunciation|Omission|Insertion>",
      "feedback": "<Vietnamese explanation only for Mispronunciation — which sound is wrong and how to fix it>"
    }
  ]
}

Scoring rules:
- overallScore: overall pronunciation quality (weighted average)
- accuracyScore: how correctly phonemes were pronounced across all words
- fluencyScore: naturalness, rhythm, and flow (100 = very natural, 0 = very choppy)
- completenessScore: percentage of target words that were spoken
- Per word:
  - errorType "None": pronounced correctly
  - errorType "Mispronunciation": said but with wrong sounds (e.g. "free" instead of "three")
  - errorType "Omission": word was skipped entirely
  - errorType "Insertion": extra word added that is not in the reference
  - feedback: ONLY for Mispronunciation — in Vietnamese, briefly explain which specific sound was wrong and how to correct it (e.g. "Âm 'th' bị đọc thành 'f'. Đặt đầu lưỡi nhẹ giữa hai hàm răng khi thở ra.")
  - feedback: empty string "" for None, Omission, Insertion

Be strict: if the pronunciation is clearly wrong, reflect that in the score. Do not give high scores for incorrect pronunciation.
`.trim();

@Injectable()
export class PronunciationService {
  private readonly logger = new Logger(PronunciationService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async assess(
    audioBuffer: Buffer,
    referenceText: string,
  ): Promise<PronunciationAssessmentResult> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1, // low temperature for consistent scoring
      },
    });

    const audioBase64 = audioBuffer.toString('base64');

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'audio/wav',
          data: audioBase64,
        },
      },
      { text: ASSESSMENT_PROMPT(referenceText) },
    ]);

    const raw = result.response.text();
    let parsed: any;

    try {
      parsed = JSON.parse(raw);
    } catch {
      this.logger.error('Gemini returned non-JSON:', raw);
      throw new Error('Gemini trả về kết quả không hợp lệ, thử lại sau.');
    }

    return {
      transcript: parsed.transcript ?? '',
      overallScore: Math.round(parsed.overallScore ?? 0),
      accuracyScore: Math.round(parsed.accuracyScore ?? 0),
      fluencyScore: Math.round(parsed.fluencyScore ?? 0),
      completenessScore: Math.round(parsed.completenessScore ?? 0),
      words: (parsed.words ?? []).map((w: any) => ({
        word: w.word ?? '',
        accuracyScore: Math.round(w.accuracyScore ?? 0),
        errorType: w.errorType ?? 'None',
        phonemes: [],
        feedback: w.feedback || undefined,
      })),
    };
  }
}
