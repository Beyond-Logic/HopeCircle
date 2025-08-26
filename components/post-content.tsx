import { useState } from "react";

export function PostContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`text-foreground leading-relaxed whitespace-pre-wrap ${
          expanded ? "" : "line-clamp-5"
        }`}
      >
        {content}
      </p>

      {content.length > 200 && ( // show button only if text is long
        <button
          title="action"
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer mt-2 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
