'use client';

import dynamic from 'next/dynamic';

const DesignEditor = dynamic(() => import('@/components/design-editor/DesignEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4" />
        <p className="text-gray-400">에디터 로딩 중...</p>
      </div>
    </div>
  ),
});

export default function EditorPage() {
  return <DesignEditor />;
}
