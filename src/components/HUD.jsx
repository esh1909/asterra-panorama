export default function HUD({ doorOpen, onToggleDoor, onResetCamera }) {
  return (
    <div className="hud">
      <div className="hud__top">
        <p className="hud__kicker">Asterra · Electric adventure sedan</p>
        <h1 className="hud__title">Vega</h1>
        <p className="hud__hint">Drag to orbit 360° · Click driver door to open/close</p>
      </div>
      <div className="hud__actions">
        <button type="button" className="hud__btn" onClick={onResetCamera}>
          Reset camera
        </button>
        <button type="button" className="hud__btn hud__btn--accent" onClick={onToggleDoor}>
          {doorOpen ? 'Close door' : 'Open door'}
        </button>
      </div>
    </div>
  )
}
