export interface KeyState {
  char: string;
  isPressed: boolean;
  code: string;
}

export enum SoundType {
  KEY_PRESS = 'KEY_PRESS',
  SPACE = 'SPACE',
  RETURN = 'RETURN',
  BELL = 'BELL',
  PAPER_FEED = 'PAPER_FEED'
}

export interface GeminiResponse {
  text: string;
}
