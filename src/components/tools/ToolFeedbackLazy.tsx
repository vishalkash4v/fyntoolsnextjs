'use client';

import dynamic from 'next/dynamic';

const ToolFeedbackBar = dynamic(() => import('@/components/tools/ToolFeedbackBar'), {
  ssr: false,
  loading: () => <div className="h-10" aria-hidden />,
});

/** Defers like/dislike + feedback dialog JS until after hydration. */
export default function ToolFeedbackLazy({
  toolName,
  toolPath,
}: {
  toolName: string;
  toolPath: string;
}) {
  return <ToolFeedbackBar toolName={toolName} toolPath={toolPath} />;
}
