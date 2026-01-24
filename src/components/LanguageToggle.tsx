import React from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";

const LanguageToggle: React.FC = () => {
  const { i18n: i18nInstance } = useTranslation();

  const setLang = (lng: "en" | "zh-CN") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  const active = i18nInstance.language;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex gap-2">
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 text-xs border font-semibold tracking-widest bg-black/60 backdrop-blur
          ${active === "en" ? "border-red-400 text-red-200" : "border-red-900/40 text-gray-300 hover:text-red-200"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("zh-CN")}
        className={`px-2 py-1 text-xs border font-semibold tracking-widest bg-black/60 backdrop-blur
          ${active === "zh-CN" ? "border-red-400 text-red-200" : "border-red-900/40 text-gray-300 hover:text-red-200"}`}
      >
        中文
      </button>
    </div>
  );
};

export default LanguageToggle;
