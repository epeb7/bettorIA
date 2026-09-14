/**
 * Token de ativação — a ponte entre "pagou via Pix" e "logou por celular".
 *
 * Fluxo completo (ver CLAUDE.md § "Autenticação por celular" e
 * "Cobrança — Pix manual com centavo único"):
 *
 *   1. Cliente paga o valor com centavo único combinado.
 *   2. Você confere no app do banco (grátis) e roda generate-link.ts com o
 *      telefone do cliente — gera este token.
 *   3. Você cola o link (com o token) na conversa do WhatsApp com o cliente.
 *   4. Cliente clica no link no celular DELE — o primeiro dispositivo a abrir
 *      "ganha" a ativação (ver ActivationToken.consumedAt). Isso é o momento
 *      que gera o segredo de dispositivo (fora do escopo deste arquivo —
 *      fica na rota HTTP de ativação, que ainda não existe).
 *
 * Tudo isso é criptografia nativa do Node — zero custo, zero dependência.
 */
import { randomBytes } from "node:crypto";

export interface ActivationToken {
  /** token único, vai na URL — ex: https://app.bettoria.com/ativar/<token> */
  token: string;
  /** identifica o cliente — é o "login por número de celular" */
  clientPhone: string;
  clientName: string;
  /** valor com centavo único que ele pagou — pra auditoria, não pra validar de novo */
  amountPaidCents: number;
  createdAt: string;
  /** null = ainda não usado. Setado no primeiro clique — token é de uso único. */
  consumedAt: string | null;
}

const TOKEN_BYTES = 24; // 192 bits — nada de força bruta viável

export function generateActivationToken(input: {
  clientPhone: string;
  clientName: string;
  amountPaidCents: number;
}): ActivationToken {
  return {
    token: randomBytes(TOKEN_BYTES).toString("base64url"),
    clientPhone: input.clientPhone,
    clientName: input.clientName,
    amountPaidCents: input.amountPaidCents,
    createdAt: new Date().toISOString(),
    consumedAt: null,
  };
}

export function activationLink(baseUrl: string, token: ActivationToken): string {
  return `${baseUrl.replace(/\/$/, "")}/ativar/${token.token}`;
}

/**
 * Marca o token como consumido. Puramente funcional — quem chama decide se
 * grava a mudança (ver TokenStore). Devolve null se já tinha sido usado,
 * pra quem chamar poder mostrar "link já usado neste dispositivo".
 */
export function consumeToken(token: ActivationToken): ActivationToken | null {
  if (token.consumedAt !== null) return null;
  return { ...token, consumedAt: new Date().toISOString() };
}
