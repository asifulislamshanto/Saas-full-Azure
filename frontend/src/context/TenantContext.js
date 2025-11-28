import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { user } = useAuth();
  const [tenantId, setTenantId] = useState(null);
  const [tenantName, setTenantName] = useState(null);

  useEffect(() => {
    if (user) {
      setTenantId(user.tenantId);
      setTenantName(user.tenantName);
    } else {
      setTenantId(null);
      setTenantName(null);
    }
  }, [user]);

  const value = {
    tenantId,
    tenantName,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};