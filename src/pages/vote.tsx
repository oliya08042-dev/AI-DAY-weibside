import AuthGate from '@/components/AuthGate';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';

type Submission = {
  id: string; title: string; description: string; author_user_id: string;
  votes_count: number; created_at: string;
};

export default function VotePage() {
  const [list, setList] = useState<Submission[]>([]);
  const [sort, setSort] = useState<'top'|'new'>('top');
  const [myVotes, setMyVotes] = useState<Record<string, true>>({});
  const [remaining, setRemaining] = useState<number>(3);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function load() {
    const table = sort === 'top' ? 'submissions_top' : 'submissions_new';
    const { data } = await supabase.from(table).select('*');
    setList((data ?? []) as Submission[]);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { data: votes } = await supabase.from('votes').select('submission_id').eq('voter_user_id', userId);
    const voted: Record<string, true> = {};
    (votes ?? []).forEach(v => { voted[(v as any).submission_id] = true; });
    setMyVotes(voted);
    setRemaining(3 - (votes?.length ?? 0));
  }

  useEffect(() => { load(); }, [sort]);

  const canVoteMore = useMemo(() => remaining > 0, [remaining]);

  async function vote(submissionId: string) {
    if (!canVoteMore || myVotes[submissionId]) return;
    setLoadingId(submissionId);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const { error } = await supabase.from('votes').insert({
      voter_user_id: userId, submission_id: submissionId
    });
    setLoadingId(null);
    if (error) {
      if (error.message.includes('VOTE_QUOTA_EXCEEDED')) alert('可用票数已用完');
      else if (error.code === '23505') alert('你已为该作品投过票');
      else alert('投票失败：' + error.message);
      return;
    }
    await load();
  }

  return (
    <AuthGate>
      <div className="container">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'8px 0 16px'}}>
          <h2>我要投票</h2>
          <div>
            <button className="btn" onClick={()=>setSort('top')} style={{marginRight:8, background: sort==='top'?'#E6FFFA':'#fff'}}>最热</button>
            <button className="btn" onClick={()=>setSort('new')} style={{background: sort==='new'?'#E6FFFA':'#fff'}}>最新</button>
          </div>
        </div>
        <div className="text-muted" style={{marginBottom:12}}>剩余票数：{remaining} / 3</div>
        <div className="grid grid-2">
          {list.map(item => (
            <div key={item.id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h3 style={{margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</h3>
                <span className="btn" style={{background:'#E6FFFA'}}>票数 {item.votes_count}</span>
              </div>
              <p className="text-muted">{item.description}</p>
              <div style={{display:'flex',gap:8}}>
                <button
                  className="btn btn-primary"
                  disabled={!!myVotes[item.id] || !canVoteMore || loadingId===item.id}
                  onClick={()=>vote(item.id)}>
                  {myVotes[item.id] ? '已投' : loadingId===item.id ? '投票中…' : '投一票'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGate>
  );
}
