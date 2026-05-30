import { useState, useEffect } from 'react';
export default function usePatients() { const [patients, setPatients] = useState([]); useEffect(() => { setPatients([]); }, []); return { patients, setPatients }; }
