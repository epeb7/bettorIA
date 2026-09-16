/**
 * O "painel admin", versão mais barata possível: um comando.
 *
 * Rodar depois de conferir no app do banco que o Pix com o centavo único
 * caiu. Gera o token de ativação e imprime o link pronto pra colar no
 * WhatsApp do cliente.
 *
 * Uso:
 *   npx tsx src/jobs/generate-link.ts --phone "+5511999999999" --name "Fulano" --amount 4937
 *
 * (--amount em centavos, ex 4937 = R$49,37 — o valor com centavo único que
 * você combinou com esse cliente, ver CLAUDE.md § "Cobrança — Pix manual
 * com centavo único")
 */
import { generateActivationToken, activationLink } from "../auth/token";
import { normalizeBrazilianMobile } from "../auth/phone";
import { FileTokenStore } from "../auth/store";

// TODO: trocar por variável de ambiente quando o domínio real existir.
const BASE_URL = process.env.APP_BASE_URL ?? "https://app.bettoria.com.br";
const STORE_PATH = "data/tokens.json"; // arquivo local — ver aviso em store.ts

function parseArgs(): { phone: string; name: string; amountCents: number } {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : args[i + 1];
  };

  const phone = get("--phone");
  const name = get("--name");
  const amountStr = get("--amount");

  if (!phone || !name || !amountStr) {
    console.error(
      "Uso: npx tsx src/jobs/generate-link.ts --phone \"+5511999999999\" --name \"Fulano\" --amount 4937"
    );
    process.exit(1);
  }

  return { phone, name, amountCents: Number(amountStr) };
}

async function main() {
  const { phone, name, amountCents } = parseArgs();

  // pega erro de digitação AGORA — sem isso, um DDD trocado só ia
  // aparecer como bug quando o cliente tentasse usar o link (ver
  // auth/phone.ts pro porquê da validação, incluindo por que não dá
  // pra simplesmente confirmar se o número existe de verdade)
  const normalizedPhone = normalizeBrazilianMobile(phone);
  if (!normalizedPhone) {
    console.error(
      `Número "${phone}" não parece um celular brasileiro válido — confere o DDD e se não falta/sobra dígito.`
    );
    process.exit(1);
  }

  const store = new FileTokenStore(STORE_PATH);

  const token = generateActivationToken({
    clientPhone: normalizedPhone,
    clientName: name,
    amountPaidCents: amountCents,
  });
  await store.save(token);

  const link = activationLink(BASE_URL, token);

  console.log(`\nAtivação gerada pra ${name} (${normalizedPhone})`);
  console.log(`Valor conferido: R$ ${(amountCents / 100).toFixed(2).replace(".", ",")}`);
  console.log(`\nCola isso no WhatsApp do cliente:\n`);
  console.log(link);
  console.log(
    `\n(lembrete: link de uso único — o primeiro dispositivo que abrir fica com a ativação)`
  );
}

main().catch((err) => {
  console.error("Falhou:", err);
  process.exit(1);
});
