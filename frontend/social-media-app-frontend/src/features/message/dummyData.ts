import type { Conversation } from "./types";

export const initialConversations: Conversation[] = [
  {
    id: "nina",
    username: "nina.st",
    fullName: "Nina Stojanovic",
    preview: "Vidimo se sutra oko 6?",
    activeMinutesAgo: 3,
    unreadCount: 2,
    isOnline: true,
    accent: "from-pink-500 via-rose-500 to-orange-400",
    messages: [
      { id: "n1", author: "them", text: "Hej, jesam li ti poslala novi mockup?", time: "18:02" },
      { id: "n2", author: "me", text: "Jesam, upravo gledam. Bas lepo izgleda.", time: "18:04", seen: true },
      { id: "n3", author: "them", text: "Super, mogu jos da sredim spacing ako treba.", time: "18:06" },
      { id: "n4", author: "me", text: "Mislim da samo header treba malo da se skrati.", time: "18:09", seen: true },
      { id: "n5", author: "them", text: "Vidimo se sutra oko 6?", time: "18:12" },
    ],
  },
  {
    id: "marko",
    username: "marko.dev",
    fullName: "Marko Jovanovic",
    preview: "Pushovao sam fix za infinite scroll.",
    activeMinutesAgo: 18,
    isOnline: true,
    accent: "from-sky-500 via-cyan-500 to-teal-400",
    messages: [
      { id: "m1", author: "them", text: "Mislim da je problem bio u observer callback-u.", time: "17:21" },
      { id: "m2", author: "me", text: "Da, video sam. Sad radi i posle refresh-a.", time: "17:24", seen: true },
      { id: "m3", author: "them", text: "Pushovao sam fix za infinite scroll.", time: "17:26" },
    ],
  },
  {
    id: "tamara",
    username: "tamara.photo",
    fullName: "Tamara Petrovic",
    preview: "Ova nova galerija izgleda mnogo bolje.",
    activeMinutesAgo: 52,
    accent: "from-violet-500 via-fuchsia-500 to-pink-400",
    messages: [
      { id: "t1", author: "me", text: "Da li ti se svidja novi prikaz slika?", time: "16:11", seen: true },
      { id: "t2", author: "them", text: "Ova nova galerija izgleda mnogo bolje.", time: "16:14" },
    ],
  },
  {
    id: "aleksa",
    username: "alexa.ui",
    fullName: "Aleksa Nikolic",
    preview: "Mozemo i sutra da prodjemo kroz ceo flow.",
    activeMinutesAgo: 131,
    accent: "from-amber-500 via-orange-500 to-red-400",
    messages: [
      { id: "a1", author: "them", text: "Sidebar je sad dosta cistiji.", time: "14:02" },
      { id: "a2", author: "me", text: "Super, sledece gledam messages page.", time: "14:05", seen: true },
      { id: "a3", author: "them", text: "Mozemo i sutra da prodjemo kroz ceo flow.", time: "14:07" },
    ],
  },
];
