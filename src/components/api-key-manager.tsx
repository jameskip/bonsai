"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useApiKey, maskApiKey } from "@/lib/api-key";

type Props = {
  variant?: "full" | "compact";
};

export function ApiKeyManager({ variant = "full" }: Props) {
  const { apiKey, setApiKey, hydrated } = useApiKey();
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);

  function save() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    setDraft("");
    setEditing(false);
    setShowKey(false);
  }

  function clear() {
    setApiKey(null);
    setDraft("");
    setEditing(false);
    setShowKey(false);
  }

  if (variant === "compact") {
    return (
      <CompactStrip
        hydrated={hydrated}
        apiKey={apiKey}
        editing={editing}
        showKey={showKey}
        draft={draft}
        setDraft={setDraft}
        setShowKey={setShowKey}
        beginEdit={() => {
          setDraft("");
          setEditing(true);
        }}
        cancel={() => {
          setEditing(false);
          setDraft("");
          setShowKey(false);
        }}
        save={save}
        clear={clear}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base">Your Anthropic API key</CardTitle>
          {hydrated &&
            (apiKey ? (
              <Badge variant="success">stored locally</Badge>
            ) : (
              <Badge variant="warning">not set</Badge>
            ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hydrated ? (
          <div className="text-xs text-muted-foreground">
            Checking your browser…
          </div>
        ) : !apiKey || editing ? (
          <div>
            <Label htmlFor="anthropic-key">
              Paste your key (starts with{" "}
              <code className="text-foreground bg-muted rounded px-1">
                sk-ant-
              </code>
              )
            </Label>
            <div className="mt-1 flex flex-wrap gap-2">
              <Input
                id="anthropic-key"
                type={showKey ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="sk-ant-…"
                className="font-mono flex-1 min-w-[16rem]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowKey((s) => !s)}
              >
                {showKey ? "Hide" : "Show"}
              </Button>
              <Button onClick={save} disabled={!draft.trim()}>
                Save
              </Button>
              {editing && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setDraft("");
                    setShowKey(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-foreground/85 font-mono text-sm bg-muted px-2 py-1 rounded">
              {maskApiKey(apiKey)}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(true);
                setDraft("");
              }}
            >
              Replace
            </Button>
            <Button size="sm" variant="ghost" onClick={clear}>
              Clear
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Stored only in this browser&apos;s{" "}
          <code className="text-foreground/80">localStorage</code>. Sent to this
          app&apos;s server only when a lab makes a Claude call, used once, and
          never logged or persisted server-side. Use a key scoped to a sandbox
          workspace.
        </p>
      </CardContent>
    </Card>
  );
}

type CompactProps = {
  hydrated: boolean;
  apiKey: string | null;
  editing: boolean;
  showKey: boolean;
  draft: string;
  setDraft: (v: string) => void;
  setShowKey: (fn: (s: boolean) => boolean) => void;
  beginEdit: () => void;
  cancel: () => void;
  save: () => void;
  clear: () => void;
};

function CompactStrip({
  hydrated,
  apiKey,
  editing,
  showKey,
  draft,
  setDraft,
  setShowKey,
  beginEdit,
  cancel,
  save,
  clear,
}: CompactProps) {
  if (!hydrated) return null;

  if (editing || !apiKey) {
    return (
      <div className="rounded-md border border-border bg-muted/30 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-foreground">
            Anthropic API key
          </span>
          {editing && (
            <Button size="sm" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            type={showKey ? "text" : "password"}
            autoComplete="off"
            spellCheck={false}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-ant-…"
            className="font-mono flex-1 min-w-[14rem]"
          />
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => setShowKey((s) => !s)}
          >
            {showKey ? "Hide" : "Show"}
          </Button>
          <Button onClick={save} disabled={!draft.trim()}>
            Save
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          Saved to your browser only. Not logged server-side.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs rounded-md border border-border bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground">Anthropic key:</span>
      <Badge variant="success">stored locally</Badge>
      <code className="font-mono text-foreground/80">{maskApiKey(apiKey)}</code>
      <Button size="sm" variant="ghost" onClick={beginEdit}>
        Replace
      </Button>
      <Button size="sm" variant="ghost" onClick={clear}>
        Clear
      </Button>
    </div>
  );
}
