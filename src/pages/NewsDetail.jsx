import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import PageShell from "../components/PageShell";
import newsItems from "../data/newsItems";
import { fetchPublicNews, fetchNewsDetail } from "../services/newsService";

const formatDate = (dateVal) => {
  if (!dateVal) return '';
  
  // Try parsing the value to a Date object if it's a string/number
  const parsedDate = new Date(dateVal);
  if (!isNaN(parsedDate.getTime())) {
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return String(dateVal).trim();
};


function NewsDetail() {
  const { newsId } = useParams();
  const [newsList, setNewsList] = useState(newsItems);
  const [currentNews, setCurrentNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const news = currentNews;
  const detailPanelRef = useRef(null);
  const shouldScrollDetail = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Fetch list of active news
    fetchPublicNews()
      .then((data) => {
        if (!cancelled && data && data.length > 0) {
          setNewsList(data);
        }
      })
      .catch((err) => console.error("Error fetching news list:", err));

    // Fetch current news details
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(newsId);
    if (isObjectId) {
      fetchNewsDetail(newsId)
        .then((data) => {
          if (!cancelled) {
            setCurrentNews(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error fetching news details:", err);
          if (!cancelled) {
            const fallback = newsItems.find(item => item.id === newsId || item._id === newsId);
            setCurrentNews(fallback || null);
            setLoading(false);
          }
        });
    } else {
      const staticItem = newsItems.find(item => item.id === newsId);
      setCurrentNews(staticItem || null);
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [newsId]);

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

    if (itemId === (news?.id || news?._id)) {
      event.preventDefault();
      detailPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      shouldScrollDetail.current = false;
    }
  };

  if (loading) {
    return (
      <PageShell
        eyebrow="News"
        title="Latest Updates"
        className="flex flex-col gap-16"
      >
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </PageShell>
    );
  }

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
            key={news._id || news.id}
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
                  {formatDate(news.date)}
                </span>
              </div>

              <h3 className="mt-5 max-w-4xl text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl">
                {news.title}
              </h3>

              <p className="mt-5 max-w-4xl text-lg font-semibold leading-8 text-slate-800">
                {news.summary}
              </p>

              <div className="mt-6 max-w-4xl space-y-4 text-base leading-8 text-slate-700">
                {Array.isArray(news.details) && news.details.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {news.action && news.action.to && news.action.label && (
                <div className="mt-8">
                  {news.action.to.startsWith('http') ? (
                    <a
                      href={news.action.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-800 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px]"
                    >
                      {news.action.label}
                    </a>
                  ) : (
                    <Link
                      to={news.action.to}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-800 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px]"
                    >
                      {news.action.label}
                    </Link>
                  )}
                </div>
              )}
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
      {newsList.map((item) => {
        const itemId = item._id || item.id;
        const isCurrent = itemId === (news?._id || news?.id);

        return (
          <Link
            key={itemId}
            to={`/news/${itemId}`}
            onClick={(event) => handleNewsTap(event, itemId)}
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
                  {formatDate(item.date)}
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
