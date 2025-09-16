import AuthGate from '@/components/AuthGate';
import Link from 'next/link';

export default function Home() {
  return (
    <AuthGate>
      <div className="container">
        <div className="card">
          <h1>AI-DAY 活动</h1>
          <p className="text-muted">长期开放的作品展示与投票。登录后即可提交作品并投票。</p>
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <Link className="btn btn-primary" href="/submit">提交作品</Link>
            <Link className="btn" href="/vote">我要投票</Link>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
