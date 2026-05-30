import { useState, useEffect } from 'react';
export default function usePharmacy() { const [inventory, setInventory] = useState([]); useEffect(() => { setInventory([]); }, []); return { inventory, setInventory }; }
