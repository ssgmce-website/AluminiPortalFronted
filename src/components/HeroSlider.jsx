import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ceremonyImage from "../assets/slide-ceremony.jpeg";
import sessionImage  from "../assets/slide-session.jpeg";
import meetImage     from "../assets/slide-meet.jpeg";
import "swiper/css";
import "swiper/css/pagination";

const slides = [
  {
    image: ceremonyImage,
    alt: "SSGMCE alumni ceremony",
    title: "Honoring The SSGMCE Alumni Tradition",
    description:
      "Celebrating alumni presence, college values, and the shared journey of the SSGMCE community.",
  },
  {
    image: sessionImage,
    alt: "SSGMCE alumni faculty session",
    title: "Learning From Alumni Experiences",
    description:
      "Connecting students with alumni through guidance sessions, faculty interaction, and career-focused discussions.",
  },
  {
    image: meetImage,
    alt: "SSGMCE grand alumni meet",
    title: "The Grand Alumni Meet",
    description:
      "Bringing alumni together to reconnect, collaborate, and strengthen lifelong bonds with SSGMCE.",
  },
];

function HeroSlider() {
  return (
    <section className="mx-auto max-w-[1425px]">
      <div className="overflow-hidden rounded-lg border border-blue-100 bg-white p-2 shadow-xl shadow-blue-950/15">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          pagination={{ clickable: true }}
          className="h-[300px] sm:h-[400px] lg:h-[505px]"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.image}>
              <div className="relative h-full">
                <img
                  className="h-full w-full object-cover"
                  src={slide.image}
                  alt={slide.alt}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-blue-950/45 to-transparent" />
                <div className="absolute bottom-6 left-4 right-4 max-w-2xl text-white sm:bottom-10 sm:left-10 sm:right-auto">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200 sm:text-sm sm:tracking-[0.2em]">
                    SSGMCE Alumni Connect
                  </p>
                  <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl md:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:mt-4 sm:text-base sm:leading-7 md:text-lg">
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
