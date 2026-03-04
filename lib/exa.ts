import Exa from 'exa-js';

export const exa = new Exa(process.env.EXA_API_KEY!);

export async function searchWeb(query: string, numResults = 5) {
  const res = await exa.searchAndContents(query, {
    numResults,
    text: { maxCharacters: 3000 },
  });
  return res.results.map(r => ({
    title: r.title ?? '',
    url: r.url,
    snippet: r.text ?? '',
  }));
}
