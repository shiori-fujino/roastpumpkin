// src/components/profile/AvailableServices.tsx
import React from "react";
import { useTranslation } from "react-i18next";

export type Service = { name: string; available: boolean };

type Props = {
  services?: Service[];
  className?: string;
};

const AvailableServices: React.FC<Props> = ({ services = [], className }) => {
  const { t } = useTranslation();

  const availableServices = (services ?? []).filter((s) => s?.available);

  if (availableServices.length === 0) return null;

  return (
    <section className={className}>
      <h3 className="font-rajdhani text-white/80 text-lg tracking-[0.12em] mb-5">
  {t("profile.availableServices")}
</h3>

      <ul className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-2">
  {availableServices.map((service) => (
    <li key={service.name} className="min-w-0">
      <span className="block text-white/90 uppercase tracking-wide text-[11px] leading-snug break-words">
        {t(`services.${service.name}`)}
      </span>
    </li>
  ))}
</ul>
    </section>
  );
};

export default AvailableServices;
