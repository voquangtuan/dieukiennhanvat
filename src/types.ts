export type CommandType = 'MOVE' | 'TURN_LEFT' | 'TURN_RIGHT' | 'WAIT' | 'SAY';

export interface Command {
  id: string;
  type: CommandType;
  value: number | string;
  label: string;
  color: string;
}

export interface GameState {
  characterPos: { x: number; y: number; rotation: number };
  isExecuting: boolean;
  currentCommandIndex: number;
  message: string;
}
