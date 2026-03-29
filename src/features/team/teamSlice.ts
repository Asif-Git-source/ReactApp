/**
 * REDUX TOOLKIT — teamSlice
 *
 * Manages the team members list. TeamMember extends the global User type
 * adding team-specific fields (joinedAt, status) without duplicating the
 * identity fields.
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

export interface TeamMember extends User {
  joinedAt: string;
  status: 'active' | 'invited' | 'inactive';
}

interface TeamState {
  members: TeamMember[];
}

const initialMembers: TeamMember[] = [
  { id: '1', name: 'Alex Johnson',  email: 'alex@devboard.io',   avatar: 'AJ', role: 'admin',     joinedAt: '2024-01-15', status: 'active'  },
  { id: '2', name: 'Sam Rivera',    email: 'sam@devboard.io',    avatar: 'SR', role: 'developer', joinedAt: '2024-02-01', status: 'active'  },
  { id: '3', name: 'Jamie Kim',     email: 'jamie@devboard.io',  avatar: 'JK', role: 'developer', joinedAt: '2024-02-20', status: 'active'  },
  { id: '4', name: 'Taylor Morgan', email: 'taylor@devboard.io', avatar: 'TM', role: 'viewer',    joinedAt: '2024-03-10', status: 'active'  },
  { id: '5', name: 'Casey Park',    email: 'casey@devboard.io',  avatar: 'CP', role: 'developer', joinedAt: '2024-03-25', status: 'invited' },
];

const teamSlice = createSlice({
  name: 'team',
  initialState: { members: initialMembers } as TeamState,
  reducers: {
    addMember: (
      state,
      action: PayloadAction<Pick<TeamMember, 'name' | 'email' | 'role'>>
    ) => {
      const { name, email, role } = action.payload;
      state.members.push({
        id: `m${Date.now()}`,
        name,
        email,
        role,
        // Generate initials from name (max 2 chars)
        avatar: name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'invited',
      });
    },

    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
    },

    updateMemberRole: (
      state,
      action: PayloadAction<{ id: string; role: User['role'] }>
    ) => {
      const member = state.members.find((m) => m.id === action.payload.id);
      if (member) member.role = action.payload.role;
    },
  },
});

export const { addMember, removeMember, updateMemberRole } = teamSlice.actions;
export default teamSlice.reducer;
