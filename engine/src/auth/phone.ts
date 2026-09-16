/**
 * Validação e normalização de celular brasileiro — a peça que faltava
 * antes de gerar token de ativação ou código de verificação (ver otp.ts):
 * sem isso, um número digitado errado por você (ex: DDD trocado, faltou
 * um dígito) só ia aparecer como bug quando o cliente tentasse usar o
 * link, ou pior, mandava o link pro número errado.
 *
 * Lista de DDDs verificada contra a estrutura oficial da Anatel (Plano
 * Geral de Códigos Nacionais) e cruzada com o pacote open-source
 * `brazilian-utils` (github.com/hyanmandian/brazilian-utils) — 67 DDDs,
 * o mesmo total documentado pela Anatel. Não é uma lista "todo dois
 * dígitos de 11 a 99": faltam vários (20, 23, 25, 26, 29, 30, 36, 39,
 * 40, 50, 52, 56...) porque nunca foram atribuídos.
 *
 * NÃO faz lookup de operadora nem confirma que o número existe de
 * verdade — isso exigiria serviço pago de terceiro e tocaria em dado
 * pessoal de quem está do outro lado (LGPD). A confirmação real de que
 * o número pertence ao cliente é o código de verificação via WhatsApp
 * (ver otp.ts) — só quem tem acesso àquele WhatsApp consegue completar
 * o login, sem a gente nunca precisar saber o nome de ninguém a partir
 * do número.
 */
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
  21, 22, 24, // RJ
  27, 28, // ES
  31, 32, 33, 34, 35, 37, 38, // MG
  41, 42, 43, 44, 45, 46, // PR
  47, 48, 49, // SC
  51, 53, 54, 55, // RS
  61, // DF
  62, 64, // GO
  63, // TO
  65, 66, // MT
  67, // MS
  68, // AC
  69, // RO
  71, 73, 74, 75, 77, // BA
  79, // SE
  81, 87, // PE
  82, // AL
  83, // PB
  84, // RN
  85, 88, // CE
  86, 89, // PI
  91, 93, 94, // PA
  92, 97, // AM
  95, // RR
  96, // AP
  98, 99, // MA
]);

/**
 * Normaliza pra E.164 (+55DDXXXXXXXXX) se for um celular brasileiro
 * válido — DDD real + 9 dígitos começando em 9 (padrão desde a
 * migração do 9º dígito, 2016). Aceita qualquer formatação de entrada
 * ("(11) 98765-4321", "11987654321", "+5511987654321" etc). Devolve
 * null pra qualquer coisa que não bata, incluindo fixo (não recebe
 * WhatsApp) — o chamador decide como reportar o erro.
 */
export function normalizeBrazilianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, "");

  // remove o "55" de país só se o resto sobrar do tamanho certo de
  // DDD+celular (evita remover por engano de um número que começa com
  // DDD 55 — ex "55987654321" tem 11 dígitos, mesmo tamanho de
  // DDD+celular sem country code, então SÓ corta o 55 quando sobrar
  // exatamente 13 dígitos com ele, nunca em ambiguidade)
  if (digits.length === 13 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  if (digits.length !== 11) return null;

  const ddd = Number(digits.slice(0, 2));
  const ninthDigit = digits[2];

  if (!VALID_DDDS.has(ddd)) return null;
  if (ninthDigit !== "9") return null;

  return `+55${digits}`;
}
