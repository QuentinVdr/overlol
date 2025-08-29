import { TeamEnum } from '@/types/TeamEnum';

type PlayerFormProps = {
  register: any;
  teamName: TeamEnum;
  playerIndex: number;
};

export function PlayerForm({ register, teamName, playerIndex }: Readonly<PlayerFormProps>) {
  const fieldPrefix = `${teamName}.${playerIndex}`;

  return (
    <div className="flex flex-row gap-2">
      <div className="flex grow flex-col">
        <label
          htmlFor={`champion-${teamName}-${playerIndex}`}
          className="pb-1 pl-0.5 text-xs text-gray-500"
        >
          Champion
        </label>
        <input
          id={`champion-${teamName}-${playerIndex}`}
          type="text"
          className="grow rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          {...register(`${fieldPrefix}.championName`)}
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor={`team-${teamName}-${playerIndex}`}
          className="pb-1 pl-0.5 text-xs text-gray-500"
        >
          Équipe
        </label>
        <input
          id={`team-${teamName}-${playerIndex}`}
          type="text"
          className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          {...register(`${fieldPrefix}.teamName`)}
        />
      </div>
      <div className="flex grow flex-col">
        <label
          htmlFor={`player-${teamName}-${playerIndex}`}
          className="pb-1 pl-0.5 text-xs text-gray-500"
        >
          Joueur
        </label>
        <input
          id={`player-${teamName}-${playerIndex}`}
          type="text"
          className="grow rounded-lg border border-gray-300 bg-white px-2 py-1 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          {...register(`${fieldPrefix}.playerName`)}
        />
      </div>
    </div>
  );
}
