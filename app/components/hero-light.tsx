// Decorative tube light: drops in on its cords, flickers on, then its light
// cascades down over the hero in widening layers. Pure CSS, runs once on load.
export function HeroLight() {
  return (
    <div className="hero-light" aria-hidden="true">
      <div className="container hero-light-inner">
      <div className="lamp">
        <div className="beam beam-1" />
        <div className="beam beam-2" />
        <div className="beam beam-3" />
        <div className="lamp-drop">
          <span className="cord cord-left" />
          <span className="cord cord-right" />
          <div className="fixture">
            <span className="tube" />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
