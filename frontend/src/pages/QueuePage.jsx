import { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import supabase from '../../config/supabaseClient';
import { AuthContext } from '../components/AuthContext';
import './QueuePage.css';

export default function QueuePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Waiting for opponent...');
  const [entryId, setEntryId] = useState(null);
  const [channel, setChannel] = useState(null);
  const navigate = useNavigate();
  const challengeId = searchParams.get('challenge_id');
<<<<<<< HEAD
  const { user } = useContext(AuthContext);

  const hasJoinedRef = useRef(false);

  if (!user) return <div>Loading...</div>;

  useEffect(() => {
    if (!user || hasJoinedRef.current) return;
    hasJoinedRef.current = true; // ensure it only runs once

    const userId = user.id;

=======
  const {user} = useContext(AuthContext)
  
  if (!user) return <div>Loading...</div>;

  useEffect(() => {
    const userId = user.id
    
    let active = true;
>>>>>>> 0e1e7c4b6e793b79d7bb1c6ab15c02605663cc14
    const joinQueue = async () => {
      const { data: existing } = await supabase
        .from('queue')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (existing) {
        await supabase.from('queue').delete().eq('id', existing.id);
      }

      const { data: entry, error } = await supabase
        .from('queue')
<<<<<<< HEAD
=======
        // .insert([{ user_id: user.id, challenge_id: challengeId }])
>>>>>>> 0e1e7c4b6e793b79d7bb1c6ab15c02605663cc14
        .insert([{ user_id: userId, challenge_id: challengeId }])
        .select()
        .single();

      if (error || !entry) {
        console.error("Failed to insert entry into queue:", error);
        return;
      }

      setEntryId(entry.id);

      const { data: others } = await supabase
        .from('queue')
        .select('*')
        .eq('challenge_id', challengeId)
        .neq('user_id', userId)
        .order('inserted_at', { ascending: true });

      if (others.length > 0) {
        const opponent = others[0];

        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert([{
            challenge_id: challengeId,
            user_1_id: userId,
            user_2_id: opponent.user_id,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (matchError || !match) {
          console.error('Failed to create match:', matchError);
          return;
        }

        await supabase.from('queue').delete().eq('id', entry.id);
        await supabase.from('queue').delete().eq('id', opponent.id);
        navigate(`/battle/${match.id}`);
      } else {
        const sub = supabase
          .channel('match-listen')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'matches',
            filter: `user_2_id=eq.${userId}`
          }, payload => {
            navigate(`/battle/${payload.new.id}`);
          })
          .subscribe();
        setChannel(sub);
      }
    };

    joinQueue();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (entryId) {
        supabase.from('queue').delete().eq('id', entryId).then(() => {
          console.log("Queue entry cleaned up");
        });
      }
    };
  }, [challengeId, user, channel, entryId]);

  const handleCancel = async () => {
    if (entryId) await supabase.from('queue').delete().eq('id', entryId);
    if (channel) supabase.removeChannel(channel);
    navigate('/challenges');
  };

  return (
    <div className="queue-page">
      <h1>{status}</h1>
      <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
    </div>
  );
}
