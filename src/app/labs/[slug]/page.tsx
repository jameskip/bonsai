import { notFound } from "next/navigation";
import { LabShell } from "@/components/lab-shell";
import { LlmAsJudgeLab } from "@/components/labs/llm-as-judge";
import { GroundednessLab } from "@/components/labs/groundedness-checker";
import { RubricBuilderLab } from "@/components/labs/rubric-builder";
import { PromptInjectionLab } from "@/components/labs/prompt-injection";
import { PairwiseBiasLab } from "@/components/labs/pairwise-bias";
import { AgentTrajectoryLab } from "@/components/labs/agent-trajectory";
import { labs, getLab } from "@/content/labs";

export function generateStaticParams() {
  return labs.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) return {};
  return { title: `${lab.title} · Bonsai`, description: lab.tagline };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();

  return (
    <LabShell lab={lab}>
      {slug === "llm-as-judge" && <LlmAsJudgeLab />}
      {slug === "groundedness-checker" && <GroundednessLab />}
      {slug === "rubric-builder" && <RubricBuilderLab />}
      {slug === "prompt-injection-lab" && <PromptInjectionLab />}
      {slug === "pairwise-bias" && <PairwiseBiasLab />}
      {slug === "agent-trajectory" && <AgentTrajectoryLab />}
    </LabShell>
  );
}
