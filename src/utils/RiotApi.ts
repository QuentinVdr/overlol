/**
 * Fetch the list of champions from the Riot API.
 * docs: https://developer.riotgames.com/docs/lol#data-dragon_champions
 * @returns {Promise<Array>} A promise that resolves to an array of champion objects.
 */
export const fetchChampionsFromAPI = async () => {
  const lastVersion = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(
    async (res) => (await res.json())[0],
  );
  const championsList = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${lastVersion}/data/fr_FR/champion.json`,
  ).then(async (res) => await res.json());

  return Object.keys(championsList.data).map((key) => ({
    name: championsList.data[key].name,
    id: championsList.data[key].id,
    image: `https://ddragon.leagueoflegends.com/cdn/${lastVersion}/img/champion/${championsList.data[key].image.full}`,
  }));
};
