// data/songs.js — Hostel Jukebox song catalogue

const songs = [
  // ── Baarish Special ──────────────────────────────────────────
  { id: 1,  title: "Baarish",                 artist: "Atif Aslam & Hadiqa Kiani",      album: "Bol (OST)",          playlist: "baarish",   duration: 258, year: 2011 },
  { id: 2,  title: "Tip Tip Barsa Pani",      artist: "Udit Narayan & Alka Yagnik",     album: "Mohra",              playlist: "baarish",   duration: 324, year: 1994 },
  { id: 3,  title: "Rimjhim Gire Sawan",      artist: "Kishore Kumar",                  album: "Manzil",             playlist: "baarish",   duration: 298, year: 1979 },
  { id: 4,  title: "Pehli Baarish",           artist: "Lucky Ali",                      album: "Sunoh",              playlist: "baarish",   duration: 246, year: 1996 },
  { id: 5,  title: "Barso Re",                artist: "Shreya Ghoshal",                 album: "Guru",               playlist: "baarish",   duration: 312, year: 2007 },
  { id: 6,  title: "Saawan Mein Lag Gayi Aag",artist: "Mika Singh & Neha Kakkar",       album: "Ginny Weds Sunny",   playlist: "baarish",   duration: 234, year: 2020 },
  // ── Ghar Ki Yaad ─────────────────────────────────────────────
  { id: 7,  title: "Ik Vaari Aa",             artist: "Arijit Singh",                   album: "Raabta",             playlist: "ghar",      duration: 275, year: 2017 },
  { id: 8,  title: "Tujhe Kitna Chahne Lage", artist: "Arijit Singh",                   album: "Kabir Singh",        playlist: "ghar",      duration: 312, year: 2019 },
  { id: 9,  title: "Phir Bhi Tumko Chahunga", artist: "Arijit Singh",                   album: "Half Girlfriend",    playlist: "ghar",      duration: 337, year: 2017 },
  { id: 10, title: "Maa",                     artist: "Shankar Mahadevan",              album: "Taare Zameen Par",   playlist: "ghar",      duration: 284, year: 2007 },
  { id: 11, title: "Ae Watan",                artist: "Arijit Singh",                   album: "Raazi",              playlist: "ghar",      duration: 298, year: 2018 },
  { id: 12, title: "Ghar",                    artist: "Nupoor & Palash",                album: "Anjaana Anjaani",    playlist: "ghar",      duration: 261, year: 2010 },
  // ── Late Night ────────────────────────────────────────────────
  { id: 13, title: "Raabta",                  artist: "Arijit Singh",                   album: "Agent Sai Srinivasa",playlist: "latenight", duration: 229, year: 2017 },
  { id: 14, title: "Agar Tum Saath Ho",       artist: "Alka Yagnik & Arijit Singh",     album: "Tamasha",            playlist: "latenight", duration: 348, year: 2015 },
  { id: 15, title: "Dil Diyan Gallan",        artist: "Atif Aslam",                     album: "Tiger Zinda Hai",    playlist: "latenight", duration: 292, year: 2017 },
  { id: 16, title: "Channa Mereya",           artist: "Arijit Singh",                   album: "Ae Dil Hai Mushkil", playlist: "latenight", duration: 328, year: 2016 },
  { id: 17, title: "Kho Gaye Hum Kahan",      artist: "Prateek Kuhad",                  album: "Kho Gaye",           playlist: "latenight", duration: 242, year: 2023 },
  { id: 18, title: "Tum Hi Ho",               artist: "Arijit Singh",                   album: "Aashiqui 2",         playlist: "latenight", duration: 261, year: 2013 },
  // ── Party Vibe ───────────────────────────────────────────────
  { id: 19, title: "Gallan Goodiyaan",        artist: "Various Artists",                album: "Dil Dhadakne Do",    playlist: "party",     duration: 218, year: 2015 },
  { id: 20, title: "Badtameez Dil",           artist: "Benny Dayal",                    album: "Yeh Jawaani Hai Deewani", playlist: "party", duration: 263, year: 2013 },
  { id: 21, title: "Tune Maari Entriyaan",    artist: "Vishal Dadlani & Benny Dayal",   album: "Gunday",             playlist: "party",     duration: 245, year: 2014 },
  { id: 22, title: "Ainvayi Ainvayi",         artist: "Salim & Sunidhi Chauhan",        album: "Band Baaja Baaraat", playlist: "party",     duration: 234, year: 2010 },
  { id: 23, title: "Dhoom Taana",             artist: "Shaan & Sunidhi Chauhan",        album: "Om Shanti Om",       playlist: "party",     duration: 256, year: 2007 },
  { id: 24, title: "Balam Pichkari",          artist: "Shalmali Kholgade & Vishal",     album: "Yeh Jawaani Hai Deewani", playlist: "party", duration: 278, year: 2013 },
  // ── Sadabahar Geet ───────────────────────────────────────────
  { id: 25, title: "Lag Ja Gale",             artist: "Lata Mangeshkar",                album: "Woh Kaun Thi",       playlist: "sadabahar", duration: 304, year: 1964 },
  { id: 26, title: "Gulabi Aankhen",          artist: "Mohammed Rafi",                  album: "The Train",          playlist: "sadabahar", duration: 287, year: 1970 },
  { id: 27, title: "Ek Pyaar Ka Nagma",       artist: "Lata Mangeshkar & Mukesh",       album: "Shor",               playlist: "sadabahar", duration: 316, year: 1972 },
  { id: 28, title: "Zindagi Ek Safar Hai Suhana", artist: "Kishore Kumar",             album: "Andaz",              playlist: "sadabahar", duration: 268, year: 1971 },
  { id: 29, title: "Yeh Shaam Mastani",       artist: "Kishore Kumar",                  album: "Kati Patang",        playlist: "sadabahar", duration: 245, year: 1970 },
  { id: 30, title: "Roop Tera Mastana",       artist: "Kishore Kumar",                  album: "Aradhana",           playlist: "sadabahar", duration: 271, year: 1969 },
];

module.exports = songs;
