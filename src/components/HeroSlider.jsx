import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=80",
    alt: "Alumni gathering",
    title: "Connect With The SSGMCE Alumni Network",
    description: "Celebrate achievements, share opportunities, and stay close to your college community.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80",
    alt: "College community event",
    title: "Build Meaningful Professional Relationships",
    description: "Bring students, faculty, and alumni together through events, mentoring, and collaboration.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
    alt: "Professional alumni meet",
    title: "Support The Next Generation",
    description: "Contribute knowledge, experience, and guidance to strengthen the SSGMCE community.",
  },
];

function HeroSlider() {
  return (
    <section className="mx-auto max-w-[1425px]">
      <div className="border border-blue-100 bg-white p-2 shadow-2xl shadow-slate-950/25">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          pagination={{ clickable: true }}
          className="h-[320px] sm:h-[430px] lg:h-[505px]"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.image}>
              <div className="relative h-full">
                <img
                  className="h-full w-full object-cover"
                  src={slide.image}
                  alt={slide.alt}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-blue-950/35 to-transparent" />
                <div className="absolute bottom-10 left-6 max-w-2xl text-white sm:left-10">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                    SSGMCE Alumni Connect
                  </p>
                  <h2 className="text-3xl font-bold leading-tight md:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-blue-50 md:text-lg">
                    {slide.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default HeroSlider;
