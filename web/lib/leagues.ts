/**
 * Campeonatos pré-cadastrados pro filtro do histórico. Lista simples de
 * propósito — quando a integração real de dados existir, cada liga ganha
 * um slug batendo com o provedor (ver CLAUDE.md § "Ligas — decisão de
 * escopo"), mas a estrutura do filtro não muda, só cresce a lista.
 *
 * Ordem importa pouco tecnicamente, mas visualmente: liga com temporada
 * mais madura no momento (mais dado, mais crível) primeiro.
 */
export interface LeagueOption {
  id: string;
  label: string;
}

export const LEAGUES: LeagueOption[] = [
  { id: "brasileirao", label: "Brasileirão" },
  { id: "la-liga", label: "La Liga" },
  { id: "champions-league", label: "Champions League" },
  { id: "premier-league", label: "Premier League" },
];
