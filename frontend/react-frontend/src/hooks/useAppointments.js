import { useState, useEffect } from 'react';
export default function useAppointments() { const [appointments, setAppointments] = useState([]); useEffect(() => { setAppointments([]); }, []); return { appointments, setAppointments }; }
