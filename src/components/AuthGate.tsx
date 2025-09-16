import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="container"><p>正在检查登录状态...</p></div>;
  }
  if (!session) {
    return (
      <div className="container" style={{display:'grid',placeItems:'center',height:'70vh'}}>
        <div className="card" style={{textAlign:'center',maxWidth:420}}>
          <h2>请先使用 Google 登录</h2>
          <p className="text-muted">登录后可提交作品并投票（每人3票）</p>
          <div style={{height:12}} />
          <button className="btn btn-primary" onClick={() => supabase.auth.signInWithOAuth({ provider:'google' })}>
            使用 Google 登录
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
