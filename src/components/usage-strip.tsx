import { Badge } from "@/components/ui/badge";

export type UsageInfo = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

export function UsageStrip({ usage, stopReason }: { usage: UsageInfo; stopReason?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="secondary" className="text-[10px]">
        in {usage.input_tokens}t
      </Badge>
      <Badge variant="secondary" className="text-[10px]">
        out {usage.output_tokens}t
      </Badge>
      {!!usage.cache_read_input_tokens && (
        <Badge variant="success" className="text-[10px]">
          cache hit {usage.cache_read_input_tokens}t
        </Badge>
      )}
      {!!usage.cache_creation_input_tokens && (
        <Badge variant="warning" className="text-[10px]">
          cache write {usage.cache_creation_input_tokens}t
        </Badge>
      )}
      {stopReason && (
        <Badge variant="outline" className="text-[10px]">
          stop: {stopReason}
        </Badge>
      )}
    </div>
  );
}
