import { HERO_SLIDE_IMAGES } from "./heroSlides";

type Props = {
  /** Index de l’image visible (contrôlé par la page). */
  activeIndex: number;
  className?: string;
};

/**
 * Fond plein écran avec fondu entre les images (le défilement est géré par le parent).
 */
export function HeroBackgroundSlider({ activeIndex, className = "" }: Props) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {HERO_SLIDE_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1100ms] ease-out"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === activeIndex ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}

type HeroSliderDotsProps = {
  active: number;
  onSelect: (index: number) => void;
};

export function HeroSliderDots({ active, onSelect }: HeroSliderDotsProps) {
  const count = HERO_SLIDE_IMAGES.length;
  return (
    <div className="flex gap-2" role="tablist" aria-label="Diaporama">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Image ${i + 1} sur ${count}`}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === active ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/70"
          }`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
