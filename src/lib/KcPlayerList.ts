import { TKcPlayer } from '@/types/KcPlayerType';
import { TRiotAccount } from '@/types/RiotAccountType';

// https://dpm.lol/leaderboards/kc

const kcLecPlayerAccountList: { [key: string]: TRiotAccount[] } = {
  // KC LEC Roster
  Canna: [{ riotPseudo: 'Katze', tagLine: 'myao', region: 'EUW' }],
  Yike: [{ riotPseudo: 'KC Yiken', tagLine: '1111', region: 'EUW' }],
  Kyeahoo: [{ riotPseudo: 'kyeahOOOOOOOOOOO', tagLine: 'FFFFF', region: 'EUW' }],
  Caliste: [{ riotPseudo: 'KC NEXT ADKING', tagLine: 'EUW', region: 'EUW' }],
  Busio: [{ riotPseudo: 'basil', tagLine: 'fan', region: 'EUW' }],
};

const kcbPlayerAccountList: { [key: string]: TRiotAccount[] } = {
  // KC Blue Roster
  Tao: [{ riotPseudo: 'xhtao', tagLine: '3100', region: 'EUW' }],
  Yukino: [
    { riotPseudo: 'kaoruko', tagLine: 'kawaii', region: 'EUW' },
    { riotPseudo: 'Yukino7', tagLine: 'cat', region: 'EUW' },
  ],
  Kamiloo: [{ riotPseudo: 'KC Kamiloo', tagLine: 'FIRE', region: 'EUW' }],
  Looki: [{ riotPseudo: 'Looki', tagLine: 'KCB', region: 'EUW' }],
  Prime: [{ riotPseudo: 'KC Prime', tagLine: '6162', region: 'EUW' }],
};

const kcbsPlayerAccountList: { [key: string]: TRiotAccount[] } = {
  // KC BS Roster
  Koala: [{ riotPseudo: 'Awful Things', tagLine: 'Koala', region: 'EUW' }],
  Oleg: [
    { riotPseudo: 'OLEG INSEC', tagLine: 'OLEG', region: 'EUW' },
    { riotPseudo: 'OLEG FULLCLEAR', tagLine: 'CLEAR', region: 'EUW' },
  ],
  Panda: [{ riotPseudo: 'KC NEXT MIDKING', tagLine: 'PANDA', region: 'EUW' }],
  Gwen: [{ riotPseudo: 'ttv gwenーnlol', tagLine: 'zeri', region: 'EUW' }],
  Alaric: [{ riotPseudo: '140 6', tagLine: '2027', region: 'EUW' }],
};

export const kcPlayersAccountList: { [key: string]: TRiotAccount[] } = {
  ...kcLecPlayerAccountList,
  ...kcbPlayerAccountList,
  ...kcbsPlayerAccountList,
};

export const kcPlayerNameAndTeamList: TKcPlayer[] = [
  ...Object.keys(kcLecPlayerAccountList).map((name) => ({ name, team: 'KC' })),
  ...Object.keys(kcbPlayerAccountList).map((name) => ({ name, team: 'KCB' })),
  ...Object.keys(kcbsPlayerAccountList).map((name) => ({ name, team: 'KCBS' })),
];
