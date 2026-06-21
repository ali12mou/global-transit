import { parseActivityContent } from "@/lib/parseActivityContent";

export type ActivityBlock = {
  _id: string;
  title: string;
  imageUrl?: string;
  intro: string;
  bullets: ReturnType<typeof parseActivityContent>["bullets"];
};

type Props = {
  block: ActivityBlock;
  /** Pair : image à gauche ; impair : image à droite */
  imageLeft: boolean;
};

export function ActivityZigzagSection({ block, imageLeft }: Props) {
  return (
    <section className="border-b border-slate-100 last:border-b-0">
      <div
        className={`mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-2 lg:items-stretch ${
          imageLeft ? "" : "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
        }`}
      >
        <div className="relative min-h-[260px] bg-slate-100 sm:min-h-[320px] lg:min-h-[380px]">
          {block.imageUrl ? (
            <img
              src={block.imageUrl}
              alt={block.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-[260px] items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-sm font-medium text-slate-400 sm:min-h-[320px] lg:min-h-[380px]">
              Global Transit
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:py-14 lg:px-12">
          <h2 className="text-2xl font-bold leading-tight text-[color:var(--color-gt-accent-orange)] md:text-[1.65rem]">
            {block.title}
          </h2>

          {block.intro ? (
            <p className="mt-4 text-[15px] leading-relaxed text-slate-700 md:text-base">{block.intro}</p>
          ) : null}

          {block.bullets.length > 0 ? (
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-slate-800 md:text-base">
              {block.bullets.map((item) => (
                <li key={`${block._id}-${item.label}`} className="pl-0">
                  <span className="font-bold text-slate-900">{item.label}:</span>{" "}
                  <span className="text-slate-700">{item.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
