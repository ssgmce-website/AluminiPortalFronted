import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarDays } from "lucide-react";
import PageShell from "../components/PageShell";
import newsItems from "../data/newsItems";

function NewsDetail() {
  const { newsId } = useParams();
  const news = newsItems.find((item) => item.id === newsId);
  const detailPanelRef = useRef(null);
  const shouldScrollDetail = useRef(false);

  useEffect(() => {
    if (!shouldScrollDetail.current) return undefined;

    const scrollTimer = window.setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      shouldScrollDetail.current = false;
    }, 120);

    return () => window.clearTimeout(scrollTimer);
  }, [newsId]);

  const handleNewsTap = (event, itemId) => {
    shouldScrollDetail.current = true;

    if (itemId === news?.id) {
      event.preventDefault();
      detailPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      shouldScrollDetail.current = false;
    }
  };

 return (
  <PageShell
    eyebrow="News"
    title="Latest Updates"
    className="flex flex-col gap-16"
  >
    {/* News Detail Section */}
    <div
      ref={detailPanelRef}
      className="scroll-mt-24 border-t border-blue-100 pt-8 mb-12"
    >
      <AnimatePresence mode="wait">
        {!news ? (
          <motion.div
            key="missing-news"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <h3 className="text-2xl font-extrabold text-slate-900">
              Update Not Found
            </h3>

            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">
              The news update you are looking for is not available.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </motion.div>
        ) : (
          <motion.article
            key={news.id}
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"
          >
            {/* Left Content */}
            <div>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-800">
                  <CalendarDays size={16} />
                  {news.date?.trim()}
                </span>
              </div>

              <h3 className="mt-5 max-w-4xl text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl">
                {news.title}
              </h3>

              <p className="mt-5 max-w-4xl text-lg font-semibold leading-8 text-slate-800">
                {news.summary}
              </p>

              <div className="mt-6 max-w-4xl space-y-4 text-base leading-8 text-slate-700">
                {news.details.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Right Image */}
            <figure className="order-first overflow-hidden rounded-lg border border-blue-100 bg-slate-100 shadow-md lg:order-last">
              <img
                src={news.image}
                alt={news.imageAlt || news.title}
                className="aspect-[4/3] w-full object-cover"
              />

              <figcaption className="border-t border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                {news.imageAlt || news.title}
              </figcaption>
            </figure>
          </motion.article>
        )}
      </AnimatePresence>
    </div>

    {/* News Cards */}
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {newsItems.map((item) => {
        const isCurrent = item.id === news?.id;

        return (
          <Link
            key={item.id}
            to={`/news/${item.id}`}
            onClick={(event) => handleNewsTap(event, item.id)}
            aria-current={isCurrent ? "page" : undefined}
            className={`group flex aspect-square flex-col overflow-hidden rounded-lg border transition-all duration-300 ${
              isCurrent
                ? "border-blue-300 bg-blue-50 shadow-md"
                : "border-blue-100 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg"
            }`}
          >
            <div className="relative h-[42%] overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.imageAlt || item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <p className="line-clamp-2 text-sm font-extrabold leading-5 text-blue-950">
                  {item.title}
                </p>

                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">
                  {item.summary}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500">
                  {item.date?.trim()}
                </p>

                {isCurrent && (
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                    Current
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </PageShell>
);
}

export default NewsDetail;
