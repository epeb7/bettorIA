import styles from "./page.module.css";
import { Header } from "@/components/Header";
import { AlertFeed } from "@/components/AlertFeed";
import { ChatBar } from "@/components/ChatBar";
import type { MatchAlert, TrackRecord } from "@/lib/types";

// TODO: substituir por dados reais do Supabase (tabelas `alerts` +
// `closing_lines`, ver CLAUDE.md § "Banco de dados"). Os valores abaixo são
// os mesmos exemplos usados no canvas de design, só pra manter a tela
// idêntica ao que foi aprovado enquanto o backend não está ligado.
const SAMPLE_TRACK_RECORD: TrackRecord = {
  windowLabel: "7 dias",
  avgClv: 0.0184,
};

const SAMPLE_ALERTS: MatchAlert[] = [
  {
    id: "sample-1",
    homeTeam: "Real Sociedad",
    awayTeam: "Girona",
    league: "La Liga",
    kickoffLabel: "21:00",
    market: "Escanteios · Over 9.5",
    bet365Odd: 2.05,
    fairOdd: 1.9,
    ev: 0.078,
    suggestedStake: 0.019,
  },
  {
    id: "sample-2",
    homeTeam: "Villarreal",
    awayTeam: "Getafe",
    league: "La Liga",
    kickoffLabel: "18:30",
    market: "Ambas Marcam · Sim",
    bet365Odd: 1.95,
    fairOdd: 1.83,
    ev: 0.061,
    suggestedStake: 0.015,
  },
];

const SUGGESTED_QUESTIONS = ["Por que esse escanteio?"];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <Header trackRecord={SAMPLE_TRACK_RECORD} />
      <AlertFeed alerts={SAMPLE_ALERTS} />
      <ChatBar suggestedQuestions={SUGGESTED_QUESTIONS} />
    </main>
  );
}
