import { youtubeId } from '../../lib/youtube'

function Poster({ src, alt }: { src: string; alt: string }) {
  if (!src) return <div className="absolute inset-0 bg-[#1c2a3a]" />
  return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
}

export function HeroBackground({ image, videoUrl, alt }: { image: string; videoUrl: string; alt: string }) {
  const id = youtubeId(videoUrl)
  return (
    <>
      <Poster src={image} alt={alt} />
      {id ? (
        <div className="hero-video-frame pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute top-1/2 left-1/2 aspect-video min-h-[125%] min-w-[125%] -translate-x-1/2 -translate-y-1/2">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0`}
              title=""
              allow="autoplay; encrypted-media"
              className="hero-video-iframe absolute inset-0 h-full w-full border-0"
              tabIndex={-1}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
