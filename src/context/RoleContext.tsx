import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '@/types';
import { mockAllRolesUsers } from '@/mock/users';

interface RoleContextType {
  currentRole: UserRole;
  currentUser: User;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('careloop_current_role');
    return (saved as UserRole) || 'health_worker';
  });

  useEffect(() => {
    localStorage.setItem('careloop_current_role', currentRole);
  }, [currentRole]);

  const currentUser = mockAllRolesUsers[currentRole] || mockAllRolesUsers.health_worker;

  return (
    <RoleContext.Provider value={{ currentRole, currentUser, setRole: setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
