import { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function Wishes() {
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [list, setList] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, snap => {
      setList(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => unsub();
  }, []);

  const sendWish = async (e) => {
    e.preventDefault();
    if(!name || !wish) return;

    await addDoc(collection(db, "wishes"), {
      name,
      wish,
      timestamp: serverTimestamp()
    });

    setName('');
    setWish('');
  };

  return (
    <div className="mt-6 p-4 border border-gold rounded bg-black/80 text-gold">
      <h3 className="font-semibold mb-2">Guest Book</h3>
      <form onSubmit={sendWish} className="flex flex-col gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama" className="p-2 rounded border border-gold bg-black text-gold"/>
        <textarea value={wish} onChange={e=>setWish(e.target.value)} placeholder="Ucapan" className="p-2 rounded border border-gold bg-black text-gold"/>
        <button type="submit" className="bg-gold text-black py-2 rounded mt-1">Hantar</button>
      </form>
      <div className="mt-4 space-y-2">
        {list.map((w)=>(<div key={w.id}><b>{w.name}:</b> {w.wish}</div>))}
      </div>
    </div>
  );
}
