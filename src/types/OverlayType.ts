import { TKcPlayer } from './KcPlayerType';
import { TPlayer } from './PlayerType';

export type TOverlay = {
  redTeam: TPlayer[];
  blueTeam: TPlayer[];
  kcPlayerSpec?: TKcPlayer;
};
