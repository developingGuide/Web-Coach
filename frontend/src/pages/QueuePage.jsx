import { useEffect, useState, useContext } from 'react';
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
  const {user} = useContext(AuthContext)
  
  if (!user) return <div>Loading...</div>;

  useEffect(() => {
    const userId = user.id
    
    let active = true;
    const joinQueue = async () => {
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return;

      const { data: entry, error } = await supabase
        .from('queue')
        // .insert([{ user_id: user.id, challenge_id: challengeId }])
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
            user_2_id: opponent.userId,
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
      if (entryId) supabase.from('queue').delete().eq('id', entryId);
    };
  }, [challengeId, navigate]);

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