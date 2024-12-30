"use client";

import React from 'react';
import styles from '../../components/analytics/styles/participantsidebar.module.css';

interface ParticipantSidebarProps {
  participants: { id: number; name: string }[];
  onSelectParticipant: (id: number) => void;
}

const ParticipantSidebar: React.FC<ParticipantSidebarProps> = ({ participants, onSelectParticipant }) => {
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>👥 Participants</h3>
      <ul className={styles.list}>
        {participants.map((participant) => (
          <li
            key={participant.id}
            className={styles.item}
            onClick={() => onSelectParticipant(participant.id)}
          >
            {participant.name}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ParticipantSidebar;
