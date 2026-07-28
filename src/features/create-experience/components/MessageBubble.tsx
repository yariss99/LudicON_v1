import type { ConversationMessage } from "../types";
import PrimaMessage from "./PrimaMessage";
import TeacherMessage from "./TeacherMessage";

type MessageBubbleProps = {
  message: ConversationMessage;
};

function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === "teacher") {
    return <TeacherMessage content={message.content} />;
  }
  if (message.role === "prima") {
    return <PrimaMessage content={message.content} />;
  }
  return (
    <p className="text-center text-xs text-slate-400">{message.content}</p>
  );
}

export default MessageBubble;
