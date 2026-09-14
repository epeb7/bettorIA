import { NextResponse } from "next/server";
import path from "node:path";
import { consumeToken } from "../../../../../engine/src/auth/token";
import { generateDeviceSecret } from "../../../../../engine/src/auth/device";
import { FileTokenStore } from "../../../../../engine/src/auth/store";

/**
 * ATENÇÃO — isto é um shim de demonstração local, não o design final.
 *
 * O FileTokenStore grava num arquivo JSON dentro de engine/data/ — funciona
 * rodando local (`next dev`), mas NÃO sobrevive a deploy serverless (Vercel
 * reinicia o filesystem a cada execução) e não aguenta duas ativações
 * simultâneas (race condition de leitura+escrita). Antes de ir pra
 * produção, troca por SupabaseTokenStore (mesma interface, ver
 * engine/src/auth/store.ts) — nada aqui muda além dessa linha.
 */
const STORE_PATH = path.join(process.cwd(), "..", "engine", "data", "tokens.json");
const store = new FileTokenStore(STORE_PATH);

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token: tokenValue } = await params;

  const token = await store.findByToken(tokenValue);
  if (!token) {
    return NextResponse.json({ error: "not_found", message: "Link inválido." }, { status: 404 });
  }

  if (token.consumedAt !== null) {
    return NextResponse.json(
      { error: "already_used", message: "Este link já foi usado neste dispositivo." },
      { status: 409 }
    );
  }

  const consumed = consumeToken(token);
  if (!consumed) {
    // corrida rara: outro request consumiu entre o findByToken e agora
    return NextResponse.json(
      { error: "already_used", message: "Este link já foi usado neste dispositivo." },
      { status: 409 }
    );
  }

  await store.update(consumed);

  const deviceSecret = generateDeviceSecret();
  // TODO: quando existir SupabaseTokenStore, o deviceSecret é gravado
  // vinculado ao usuário aqui, não só devolvido pro cliente guardar sozinho.

  return NextResponse.json({
    clientName: token.clientName,
    deviceSecret,
  });
}
