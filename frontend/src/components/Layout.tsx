import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  hideNav?: boolean;
}

export default function Layout({ children, title, description, hideNav = false }: LayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Head>
        <title>{title} - HAN-NO.AI</title>
        <meta name="description" content={description || 'HAN-NO.AI - ECサイト分析ツール'} />
      </Head>
      
      {!hideNav && session && (
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/analyze" className="text-2xl font-bold">
              HAN-NO.AI
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                href="/analyze"
                className={`text-sm font-medium ${router.pathname === '/analyze' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                分析
              </Link>
              <Link 
                href="/dashboard"
                className={`text-sm font-medium ${router.pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                履歴
              </Link>
              <Link 
                href="/settings"
                className={`text-sm font-medium ${router.pathname === '/settings' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                設定
              </Link>
              
              <div className="flex items-center gap-3 ml-6">
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || ''} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ログアウト
                </button>
              </div>
            </nav>
          </div>
        </header>
      )}
      
      <main className={`container mx-auto px-4 py-8 ${hideNav ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
}
