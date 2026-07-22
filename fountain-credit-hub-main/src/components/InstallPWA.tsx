import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import logo from "@/assets/fountain-credit-logo.png";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Bold, always-visible PWA install banner using the app logo.
 * - On Chromium/Android: uses the native beforeinstallprompt when available.
 * - Otherwise (iOS Safari, desktop without a captured prompt): shows clear
 *   Add-to-Home-Screen instructions so the banner is never a dead-end.
 */
export function InstallPWA() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (standalone) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIOS(ios);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Always show the banner so users can install (or learn how).
    setVisible(true);

    const onInstalled = () => setVisible(false);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    setShowHelp(false);
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setVisible(false);
      setDeferred(null);
      return;
    }
    // No native prompt available — show manual instructions.
    setShowHelp((s) => !s);
  };

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-primary/50 bg-primary/10 shadow-card ring-1 ring-primary/10">
      <div className="flex items-center gap-3 p-4">
        <img
          src={logo}
          alt="Fountain Credit"
          className="h-14 w-14 shrink-0 rounded-xl object-contain shadow-soft"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight">Install Fountain Credit</p>
          <p className="text-xs text-muted-foreground">
            Get the app on your home screen for fast, one-tap access.
          </p>
        </div>
        <Button size="sm" onClick={install} className="shrink-0">
          <Download className="mr-1 h-4 w-4" /> Install
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-background/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showHelp && (
        <div className="border-t border-primary/20 bg-background/50 px-4 py-3 text-xs text-muted-foreground">
          {isIOS ? (
            <p className="flex items-center gap-1.5">
              On iPhone: tap the <Share className="inline h-3.5 w-3.5" />
              <span className="font-semibold text-foreground">Share</span> icon in Safari, then
              choose <span className="font-semibold text-foreground">“Add to Home Screen”</span>.
            </p>
          ) : (
            <p>
              In your browser menu (⋮), tap{" "}
              <span className="font-semibold text-foreground">“Install app”</span> or{" "}
              <span className="font-semibold text-foreground">“Add to Home screen”</span> to install
              Fountain Credit.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
