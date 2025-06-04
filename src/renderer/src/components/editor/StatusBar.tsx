import { Bot, BotOff, SettingsIcon } from "lucide-react";
import { getLanguage } from "../../editor/languages";
import { LanguageSelector } from "./LanguageSelector";
import { SettingsModal } from "../settings/settings-dialog";
import { useAppStore } from "../../stores/app-store";

export function StatusBar({
  language,
  isAutoDetect,
  onLangChange
}: {
  language: string;
  isAutoDetect: boolean;
  onLangChange: (lang: string) => void;
}) {
  const lang = getLanguage(language);

  const isCopilotEnabled = useAppStore((state) => state.userSettings.ai.enabled);
  const toggleCopilot = useAppStore((state) => state.toggleCopilot);
  const toggleSettingsVisible = useAppStore((state) => state.toggleSettingsDialog);
  const isSettingsVisible = useAppStore((state) => state.isSettingsDialogOpen);

  return (
    <div className="bg-[#16161D] w-full text-white text-xs px-4 flex justify-end items-center">
      <SettingsModal open={isSettingsVisible} onOpenChange={toggleSettingsVisible} />

      {lang && (
        <div>
          <LanguageSelector
            trigger={
              <div className="cursor-pointer text-gray-400 hover:text-white transition-colors duration-200">
                {lang.name} {isAutoDetect && <span className="text-gray-500">(auto)</span>}
              </div>
            }
            onSelect={onLangChange}
            currentLanguage={language}
          />
        </div>
      )}

      <div className="ml-3">
        {isCopilotEnabled ? (
          <Bot
            onClick={toggleCopilot}
            className="w-3.5 cursor-pointer text-green-300 hover:text-green-500 transition-colors duration-200"
          />
        ) : (
          <BotOff
            onClick={toggleCopilot}
            className="w-3.5 cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
          />
        )}
      </div>

      <div className="ml-3">
        <SettingsIcon
          className="w-3.5 cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
          onClick={toggleSettingsVisible}
        />
      </div>
    </div>
  );
}
