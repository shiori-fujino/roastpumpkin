// src/components/RosterCard.tsx

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RosterModel } from "../lib/roster/providerMap";

type Props = {
  model: RosterModel;
  natLabel: (raw: string) => string;
};

const RosterCard: React.FC<Props> = ({ model, natLabel }) => {
  const { t } = useTranslation();

  return (
    <Link
      to={`/profile/${model.slug}`}
      className="relative aspect-[3/4] overflow-hidden group block"
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,0,255,0.2)" }}
    >
      <img
        src={model.image}
        alt={model.name}
        className="w-full h-full object-cover object-[center_35%] transition-transform duration-500 group-hover:scale-110"
      />

       {typeof model.hourly === "number" && (
        <span
          className="z-10 absolute bottom-3 right-3 bg-black/75 text-white text-sm px-2 py-1 font-bold tracking-wide border border-red-500/40"
          style={{ boxShadow: "0 0 12px rgba(255,40,40,0.35)" }}
        >
          ${model.hourly} <span className="text-xs text-gray-300">/hr</span>
        </span>
      )} 

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <h3
            className="text-white font-bold text-lg"
            style={{ textShadow: "0 0 10px rgba(0,0,0,0.9)" }}
          >
            {model.name}
          </h3>

          {model.isNew && (
            <span
              className="bg-red-900 text-white text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider animate-pulse relative right-[-2px]"
              style={{ boxShadow: "0 0 10px rgba(255, 120, 80, 0.35)" }}
            >
              {t("badges.new")}
            </span>
          )}
        </div>

        <p className="text-white text-lg">{natLabel(model.nationality)}</p>

        {model.workingTime && 
        <p className="text-gray-200 text-sm mt-1">{model.workingTime}</p>}
      </div>
    </Link>
  );
};

export default RosterCard;
