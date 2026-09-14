/**
 * TokenStore — interface trocável, mesmo princípio do adaptador da OddsPapi
 * (ver "Decisões de arquitetura" no CLAUDE.md: isolar a peça que muda).
 *
 * FileTokenStore abaixo é só pra rodar HOJE, local, sem depender de banco
 * nenhum — é literalmente grátis. NÃO é pra produção: um arquivo JSON não
 * aguenta duas requisições simultâneas escrevendo (race condition) e não
 * sobrevive a um ambiente serverless (Vercel/Render reiniciam o disco a
 * cada execução). Trocar por SupabaseTokenStore quando o banco existir —
 * é só implementar a mesma interface, nada mais muda.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { ActivationToken } from "./token";

export interface TokenStore {
  save(token: ActivationToken): Promise<void>;
  findByToken(token: string): Promise<ActivationToken | null>;
  update(token: ActivationToken): Promise<void>;
}

export class FileTokenStore implements TokenStore {
  constructor(private readonly filePath: string) {}

  private async readAll(): Promise<ActivationToken[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as ActivationToken[];
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }

  private async writeAll(tokens: ActivationToken[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(tokens, null, 2), "utf-8");
  }

  async save(token: ActivationToken): Promise<void> {
    const all = await this.readAll();
    all.push(token);
    await this.writeAll(all);
  }

  async findByToken(token: string): Promise<ActivationToken | null> {
    const all = await this.readAll();
    return all.find((t) => t.token === token) ?? null;
  }

  async update(updated: ActivationToken): Promise<void> {
    const all = await this.readAll();
    const idx = all.findIndex((t) => t.token === updated.token);
    if (idx === -1) throw new Error(`token não encontrado: ${updated.token}`);
    all[idx] = updated;
    await this.writeAll(all);
  }
}

// TODO quando o Supabase existir (ver CLAUDE.md § "Banco de dados"):
// export class SupabaseTokenStore implements TokenStore { ... }
// mapeia pra tabela `users` (segredo_dispositivo fica null até a ativação).
