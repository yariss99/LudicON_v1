type SignatureConstellationProps = {
  styles: string[];
};

function SignatureConstellation({ styles }: SignatureConstellationProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {styles.map((style, index) => (
        <span
          key={style}
          className={[
            "rounded-full px-4 py-2 text-sm font-medium ring-1 transition-transform",
            index === 0
              ? "bg-slate-900 text-white ring-slate-900"
              : "bg-white text-slate-700 ring-slate-200",
          ].join(" ")}
        >
          {style}
        </span>
      ))}
    </div>
  );
}

export default SignatureConstellation;
