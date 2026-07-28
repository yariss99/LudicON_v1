type TeacherMessageProps = {
  content: string;
};

function TeacherMessage({ content }: TeacherMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-slate-900 px-4 py-3 text-sm leading-relaxed text-white">
        {content}
      </div>
    </div>
  );
}

export default TeacherMessage;
