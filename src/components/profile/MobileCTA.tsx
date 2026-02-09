// src/components/profile/MobileCTA.tsx
import React from "react";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  phoneNumber: string; // e.g. "+61417888123"
  className?: string;
};

const MobileCTA: React.FC<Props> = ({ phoneNumber, className }) => {
  const { t } = useTranslation();

  return (
    <div
      className={
        className ??
        "lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-red-900/40 z-50"
      }
    >
      <a
        href={`tel:${phoneNumber}`}
        className="w-full flex items-center justify-center gap-3 bg-red-900 text-white font-bold py-4 px-6 uppercase tracking-wider rounded-md border border-red-900 hover:bg-white/5 transition-colors"
      >
        <Phone className="w-5 h-5" />
        {t("common.bookNow", { defaultValue: "Book Now" })}
      </a>
    </div>
  );
};

export default MobileCTA;
