'use client';

import LikeDislikeButtons from '@/components/tools/LikeDislikeButtons';
import FeedbackButton from '@/components/tools/FeedbackButton';
import { SITE_URL } from '@/lib/seo/site';

type Props = {
  toolName: string;
  toolPath?: string;
};

/** Like / dislike + written feedback — shown on every tool page header. */
export default function ToolFeedbackBar({ toolName, toolPath }: Props) {
  const toolUrl = toolPath ? `${SITE_URL}${toolPath}` : undefined;

  return (
    <div
      className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 min-h-[40px]"
      aria-label="Tool feedback"
    >
      <LikeDislikeButtons toolName={toolName} toolUrl={toolUrl} />
      <FeedbackButton toolName={toolName} toolUrl={toolUrl} />
    </div>
  );
}
