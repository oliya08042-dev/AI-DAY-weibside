import AuthGate from '@/components/AuthGate';
import { supabase } from '@/lib/supabaseClient';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';

export default function SubmitPage() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (title.length < 1 || title.length > 60) return setMsg('作品名称需 1–60 字');
    if (desc.length < 10 || desc.length > 500) return setMsg('作品简介需 10–500 字');

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { setLoading(false); return setMsg('未登录'); }

    const { error } = await supabase.from('submissions').insert({
      title, description: desc, author_user_id: userId
    });
    setLoading(false);
    if (error) return setMsg('提交失败：' + error.message);
    setMsg('提交成功，已同步到投票页');
    setTimeout(() => router.push('/vote'), 800);
  }

  return (
    <AuthGate>
      <div className="container">
        <div className="card">
          <h2>提交作品</h2>
          <form onSubmit={onSubmit} className="grid">
            <input className="input" placeholder="作品名称（1–60字）" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="input" placeholder="作品简介（10–500字）" rows={6} value={desc} onChange={e=>setDesc(e.target.value)} />
            <div style={{display:'flex',gap:12}}>
              <button className="btn btn-primary" disabled={loading}>{loading?'提交中…':'提交'}</button>
            </div>
            {msg && <div className="text-muted">{msg}</div>}
          </form>
        </div>
      </div>
    </AuthGate>
  );
}
