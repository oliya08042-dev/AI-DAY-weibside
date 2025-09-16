import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setName(data.user?.email ?? null)); }, []);
  return (
    <div className="nav">
      <div className="container nav-inner">
        <div className="brand">AI-DAY</div>
        <Link className="btn" href="/">首页</Link>
        <Link className="btn" href="/submit">提交作品</Link>
        <Link className="btn" href="/vote">我要投票</Link>
        <div className="spacer" />
        <span className="text-muted" style={{marginRight:8}}>{name ?? ''}</span>
        <button className="btn" onClick={() => supabase.auth.signOut()}>退出登录</button>
      </div>
    </div>
  );
}
