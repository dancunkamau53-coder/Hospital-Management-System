import { createContext, useState } from 'react';
export const HospitalContext = createContext(null);
export function HospitalProvider({ children }) { const [hospital, setHospital] = useState(null); return <HospitalContext.Provider value={{ hospital, setHospital }}>{children}</HospitalContext.Provider>; }
