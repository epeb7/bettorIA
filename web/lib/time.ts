/**
 * Formatação de horário e contagem regressiva — tudo calculado no
 * navegador a partir do horário do jogo que já veio do banco. Nenhuma
 * chamada de rede, nenhum custo de API.
 */

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function formatKickoffLabel(kickoffAt: string, now: Date = new Date()): string {
  const kickoff = new Date(kickoffAt);
  const time = kickoff.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfDay(kickoff).getTime() - startOfDay(now).getTime()) / 86_400_000
  );

  if (diffDays === 0) return `hoje ${time}`;
  if (diffDays === 1) return `amanhã ${time}`;
  if (diffDays > 1 && diffDays <= 6) return `${WEEKDAYS[kickoff.getDay()]} ${time}`;
  return `${kickoff.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${time}`;
}

export function minutesUntilKickoff(kickoffAt: string, now: Date = new Date()): number {
  return Math.round((new Date(kickoffAt).getTime() - now.getTime()) / 60_000);
}

export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return "ao vivo agora";
  if (minutes < 60) return `começa em ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest > 0 ? `começa em ${hours}h ${rest}min` : `começa em ${hours}h`;
  const days = Math.floor(hours / 24);
  return `começa em ${days} ${days === 1 ? "dia" : "dias"}`;
}
