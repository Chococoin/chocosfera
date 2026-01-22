// Re-export FamilyMember from the shared FamilyTree component
export type { FamilyMember } from '../../components/FamilyTree';

export interface Invitation {
  id: string;
  recipientEmail: string;
  status: string;
  sentAt: Date;
  expiresAt: Date;
}
