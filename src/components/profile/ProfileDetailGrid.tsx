// src/components/profile/ProfileDetailsGrid.tsx
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  natLabel: (raw: string) => string;
  nationality?: string;
  height?: number;
  weight?: number;
  bust?: string;
  dressSize?: number;
  figure?: string;
  hair?: string;
  skin?: string;
  tattoos?: string;
  pubes?: string;
  className?: string;
};

type RowProps = {
  label: string;
  value: React.ReactNode;
};

function Row({ label, value }: RowProps) {
  return (
    <div className="flex gap-3">
      <span className="text-zinc-500 text-xs uppercase tracking-[0.25em] shrink-0">
        {label}
      </span>
      <span className="text-white/90 text-sm sm:text-base">
        {value}
      </span>
    </div>
  );
}

const ProfileDetailsGrid: React.FC<Props> = ({
  natLabel,
  nationality,
  height,
  weight,
  bust,
  dressSize,
  figure,
  hair,
  skin,
  tattoos,
  pubes,
  className,
}) => {
  const { t } = useTranslation();

  const rows = [
    nationality && { label: t("profile.from"), value: natLabel(nationality) },
    height != null && { label: t("profile.height"), value: `${height} cm` },
    weight != null && { label: t("profile.weight"), value: `${weight} kg` },
    bust && { label: t("profile.cup"), value: bust },
    dressSize != null && { label: t("profile.dressSize"), value: dressSize },
    figure && { label: t("profile.figure"), value: figure },
    hair && { label: t("profile.hair"), value: hair },
    skin && { label: t("profile.skin"), value: skin },
    tattoos && { label: t("profile.tattoos"), value: tattoos },
    pubes && { label: t("profile.pubes"), value: pubes },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  if (rows.length === 0) return null;

  return (
    <section className={className}>
      <h3 className="text-white/70 font-rajdhani text-lg tracking-[0.12em] mb-5">
        {t("profile.details", { defaultValue: "Details" })}
      </h3>

      <div className="grid grid-cols-3 gap-x-4 gap-y-4">
  {rows.map((row, i) => (
    <Row key={i} label={row.label} value={row.value} />
  ))}
</div>
    </section>
  );
};

export default ProfileDetailsGrid;
