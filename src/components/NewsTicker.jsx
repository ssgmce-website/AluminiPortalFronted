import { Link } from 'react-router-dom';
import MarqueeModule from "react-fast-marquee";
import newGif from '../assets/images/home/new.gif';

const Marquee = MarqueeModule?.default?.default ?? MarqueeModule?.default ?? MarqueeModule;

const NewsTicker = ({ items = [] }) => {
  const tickerItems = Array.isArray(items) ? items : [];

  if (tickerItems.length === 0) return null;

  const getItemPath = (item) => `/news/${item?._id || item?.id || ''}`;

  return (
    <section
      aria-label="News ticker"
      className="-my--1 mx-auto max-w-[2000px] px-4"
    >
      <style>{`
        .news-ticker-shell {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-height: 44px;
          overflow: hidden;
          border: 1px solid rgba(148,163,184,0.28);
          border-radius: 9999px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98)),
            radial-gradient(circle at 12% 50%, rgba(59,130,246,0.12), transparent 34%);
          box-shadow: 0 14px 30px rgba(15,23,42,0.08);
        }
        .news-ticker-shell::before,
        .news-ticker-shell::after {
          content: "";
          position: absolute;
          top: 0;
          z-index: 2;
          height: 100%;
          width: 3.5rem;
          pointer-events: none;
        }
        .news-ticker-shell::before {
          left: 8.25rem;
          background: linear-gradient(90deg, rgba(255,255,255,0.98), transparent);
        }
        .news-ticker-shell::after {
          right: 0;
          background: linear-gradient(270deg, rgba(248,250,252,0.98), transparent);
        }
        .news-label {
          position: relative;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          align-self: stretch;
          padding: 0 1.1rem;
          border-right: 1px solid rgba(191,219,254,0.85);
          background: linear-gradient(180deg, #eff6ff, #dbeafe);
          color: #1e3a8a;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .news-label-dot {
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 9999px;
          background: #f59e0b;
          box-shadow: 0 0 0 5px rgba(245,158,11,0.14);
          animation: blinkDot 1.25s ease-in-out infinite;
        }
        .news-track {
          min-width: 0;
          flex: 1;
          padding-right: 0.8rem;
        }
        .news-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          flex-shrink: 0;
          margin-right: 3.5rem;
          color: #172554;
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .news-item:hover {
          color: #1d4ed8;
          transform: translateY(-1px);
        }
        .news-gif {
          height: 1.45rem;
          width: auto;
          flex-shrink: 0;
          object-fit: contain;
        }
        @media (max-width: 640px) {
          .news-ticker-shell {
            min-height: 42px;
            gap: 0.45rem;
            border-radius: 0.85rem;
          }
          .news-label {
            padding: 0 0.7rem;
            font-size: 0.68rem;
          }
          .news-ticker-shell::before {
            left: 6.6rem;
            width: 2rem;
          }
          .news-ticker-shell::after {
            width: 2rem;
          }
          .news-item {
            margin-right: 2.5rem;
            font-size: 0.82rem;
          }
          .news-gif {
            height: 1.25rem;
          }
        }
        @keyframes blinkDot { 0%, 100% { opacity: 0.35; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="news-ticker-shell">
        <div className="news-label">
          <span className="news-label-dot" aria-hidden="true" />
          Notification
        </div>
        <div className="news-track">
          <Marquee speed={36} pauseOnHover gradient={false}>
            {tickerItems.map((it, idx) => (
              <Link
                key={it?.id ?? it?._id ?? idx}
                to={getItemPath(it)}
                className="news-item"
                aria-label={`Open news: ${it?.title || 'Latest update from SSGMCE'}`}
              >
                <img src={newGif} alt="New" className="news-gif" />
                <span>{it?.title || 'Latest update from SSGMCE'}</span>
              </Link>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default NewsTicker; 
