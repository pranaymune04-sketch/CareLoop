import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RoleProvider } from '@/context/RoleContext';
import { AppRoutes } from '@/routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RoleProvider>
        <AppRoutes />
      </RoleProvider>
    </BrowserRouter>
  );
};

export default App;
