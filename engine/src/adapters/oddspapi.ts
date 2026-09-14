/**
 * Adaptador isolado da OddsPapi — ver "Decisões de arquitetura" no CLAUDE.md.
 * Toda a lógica do motor conversa com a interface abaixo, nunca com a API
 * direto. Troca de provedor = trocar este arquivo, nada mais.
 *
 * FORMATO REAL, verificado em 2026-09-14 (não confirmado com chave de verdade
 * ainda — ajustar tournamentIds e nomes de bookmaker no primeiro teste real):
 *   host:   https://api.oddspapi.io
 *   auth:   query param ?apiKey=...
 *   evento: GET /v4/odds-by-tournaments?bookmaker=<nome>&tournamentIds=<ids>&apiKey=...
 *   casas:  GET /v4/bookmakers?apiKey=...
 */

const BASE_URL = "https://api.oddspapi.io";

export interface OddsPapiBookmakerOdds {
  markets: unknown; // formato exato a confirmar no primeiro teste real
  fixturePath?: string;
}

export interface OddsPapiFixture {
  fixtureId: string;
  participant1Id: string;
  participant2Id: string;
  sportId: string;
  tournamentId: string;
  seasonId: string;
  statusId: string;
  hasOdds: boolean;
  startTime: string;
  updatedAt: string;
  bookmakerOdds: Record<string, OddsPapiBookmakerOdds>;
}

export interface OddsPapiBookmaker {
  name: string;
  active?: boolean;
}

export class OddsPapiAdapter {
  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error(
        "OddsPapiAdapter precisa de uma apiKey — defina ODDSPAPI_API_KEY no ambiente, nunca no código."
      );
    }
  }

  private async get<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(BASE_URL + path);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set("apiKey", this.apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OddsPapi ${path} -> HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    return (await res.json()) as T;
  }

  /** Lista as casas de apostas disponíveis. Útil pra confirmar o nome exato de "Bet365". */
  async listBookmakers(): Promise<OddsPapiBookmaker[]> {
    return this.get<OddsPapiBookmaker[]>("/v4/bookmakers", {});
  }

  /**
   * Busca jogos + odds de um ou mais campeonatos, filtrando por casa.
   * @param bookmaker nome exato da casa (ex: "bet365", "pinnacle") — confirmar via listBookmakers()
   * @param tournamentIds ids dos campeonatos (La Liga, Champions, Premier — mapear depois de ter chave)
   */
  async getOddsByTournaments(
    bookmaker: string,
    tournamentIds: string[]
  ): Promise<OddsPapiFixture[]> {
    return this.get<OddsPapiFixture[]>("/v4/odds-by-tournaments", {
      bookmaker,
      tournamentIds: tournamentIds.join(","),
    });
  }
}

export function oddsPapiFromEnv(): OddsPapiAdapter {
  const key = process.env.ODDSPAPI_API_KEY;
  if (!key) {
    throw new Error(
      "ODDSPAPI_API_KEY não definida. Crie um .env local (ver .env.example) ou configure no Render."
    );
  }
  return new OddsPapiAdapter(key);
}
