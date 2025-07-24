import { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import supabase from '../../config/supabaseClient';
import { AuthContext } from '../components/AuthContext';
import './QueuePage.css';

export default function QueuePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Waiting for opponent...');
  const challengeId = searchParams.get('challenge_id');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const entryIdRef = useRef(null);
  const channelRef = useRef(null);
  const joinedRef = useRef(false); // prevent re-running join logic

  useEffect(() => {
    if (!user || !challengeId || joinedRef.current) return;
    joinedRef.current = true;

    const userId = user.id;

    const joinQueue = async () => {
      // Ensure only one queue entry per user
      await supabase.from('queue').delete().eq('user_id', userId).eq('challenge_id', challengeId);

      // Insert new queue entry
      const { data: entry, error } = await supabase
        .from('queue')
        .insert([{ user_id: userId, challenge_id: challengeId }])
        .select()
        .single();

      if (error || !entry) {
        console.error("Failed to insert entry into queue:", error);
        return;
      }

      entryIdRef.current = entry.id;

      // Check for opponents
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

        await supabase.from('queue').delete().in('id', [entry.id, opponent.id]);
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

        channelRef.current = sub;
      }
    };

    joinQueue();

    return () => {
      // Cleanup on leave/unmount
      if (entryIdRef.current) {
        supabase.from('queue').delete().eq('id', entryIdRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, challengeId]);

  const handleCancel = async () => {
    if (entryIdRef.current) {
      await supabase.from('queue').delete().eq('id', entryIdRef.current);
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    navigate('/challenges');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="queue-page">
      <h1>{status}</h1>
      <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
    </div>
  );
}
