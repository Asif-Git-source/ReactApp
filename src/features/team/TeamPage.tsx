/**
 * TEAM PAGE
 *
 * Demonstrates:
 *  - useAppSelector to read team members from Redux
 *  - useAppDispatch to update/remove members
 *  - Select atom for inline role changes (dispatches updateMemberRole)
 *  - Modal organism + InviteMemberForm (RHF + Zod)
 *  - useState for modal open/close only
 */
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeMember, updateMemberRole } from './teamSlice';
import type { TeamMember } from './teamSlice';
import { useToast } from '../../components/organisms/Toast';
import Modal from '../../components/organisms/Modal';
import InviteMemberForm from './InviteMemberForm';
import Select from '../../components/atoms/Select';
import type { User } from '../../types';

const ROLE_OPTIONS = [
  { value: 'viewer',    label: 'Viewer'    },
  { value: 'developer', label: 'Developer' },
  { value: 'admin',     label: 'Admin'     },
];

const STATUS_STYLES: Record<TeamMember['status'], string> = {
  active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  invited:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  inactive: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};

const AVATAR_COLORS = [
  'bg-purple-600', 'bg-blue-600', 'bg-green-600',
  'bg-orange-600', 'bg-pink-600', 'bg-teal-600',
];

export default function TeamPage() {
  const dispatch = useAppDispatch();
  const members  = useAppSelector((state) => state.team.members);
  const { showToast } = useToast();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleRoleChange = (id: string, role: User['role']) => {
    dispatch(updateMemberRole({ id, role }));
    showToast('Role updated', 'info');
  };

  const handleRemove = (member: TeamMember) => {
    dispatch(removeMember(member.id));
    showToast(`${member.name} removed from team`, 'info');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''} ·{' '}
            {members.filter((m) => m.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Invite Member
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, i) => (
          <div
            key={member.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4"
          >
            {/* Top row: avatar + name + remove */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {member.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{member.name}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[140px]">{member.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(member)}
                title="Remove member"
                className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[member.status]}`}>
                {member.status}
              </span>
              <span className="text-xs text-slate-400">since {member.joinedAt}</span>
            </div>

            {/* Role selector */}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Role</p>
              <Select
                options={ROLE_OPTIONS}
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value as User['role'])}
                className="text-xs py-1.5"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
      >
        <InviteMemberForm onSuccess={() => setShowInviteModal(false)} />
      </Modal>
    </div>
  );
}
