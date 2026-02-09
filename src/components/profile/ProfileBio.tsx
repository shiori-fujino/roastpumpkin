// src/components/profile/ProfileBio.tsx
import React from "react";

type Props = {
  bio?: string;
  name?: string;
  className?: string;
};

const ProfileBio: React.FC<Props> = ({ bio, name, className }) => {
  if (!bio) return null;

  return (
    <section className={className}>
      {name && (
        <h3 className="font-rajdhani text-white/75 text-lg tracking-[0.12em] mb-4">
          About {name}
        </h3>
      )}

      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
        {bio}
      </p>
    </section>
  );
};

export default ProfileBio;
