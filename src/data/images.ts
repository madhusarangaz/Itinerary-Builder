/** Prototype photography: Wikimedia Commons landmarks + Unsplash hotels (static URLs). */
const wiki = (file: string, width = 1280) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`

export const photos = {
  cover: wiki('Lotus_Tower_Floating_Market-Colombo_Srilanka-Andres_Larin.jpg', 1800),
  colombo: wiki('Lotus_Tower_Floating_Market-Colombo_Srilanka-Andres_Larin.jpg', 1600),
  sigiriya: wiki('Sigiriya.jpg', 1600),
  kandy: wiki('Temple_of_the_Sacred_Tooth_Relic.jpg', 1400),
  tea: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80',
  train: wiki('Nine_Arch_Bridge_Ella.jpg', 1600),
  mirissa: wiki('Mirissa_Beach.jpg', 1600),
  beach: wiki('Mirissa_Beach.jpg', 1600),
  nineArches: wiki('Nine_Arch_Bridge_Ella.jpg', 1600),
  galle: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1400&q=80',
  safari: wiki('Sri_Lankan_elephant.jpg', 1400),
  pool: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
  expert: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  hotelColombo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
  hotelSigiriya: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
  hotelKandy: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80',
  hotelNuwara: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
  hotelMirissa: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80',
  yala: wiki('Sri_Lankan_elephant.jpg', 1400),
  temple: wiki('Temple_of_the_Sacred_Tooth_Relic.jpg', 1200),
}

/** Short cinematic Sri Lanka film used as the sample header background (muted autoplay). Swap via Trip Details. */
export const sampleHeroVideo = 'https://www.youtube.com/watch?v=q0rMXhbEeX0'
