import { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

/* ── Emoji data ──────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: 'recent', label: 'Recent', icon: '🕐',
    emojis: [],
  },
  {
    id: 'smileys', label: 'Smileys & Emotion', icon: '😀',
    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','🫨','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','😵‍💫','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  },
  {
    id: 'people', label: 'People & Body', icon: '👋',
    emojis: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','🫵','👈','👉','👆','🖕','👇','☝️','🫶','👍','👎','✊','👊','🤛','🤜','👏','🙌','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁️','👅','👄','🫦','👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🫃','🫄','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧝','🧛','🧟','🧞','🧜','🧚','👫','👬','👭','💏','💑','👨‍👩‍👦','👨‍👩‍👧','👨‍👩‍👧‍👦','👪'],
  },
  {
    id: 'animals', label: 'Animals & Nature', icon: '🐶',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🪲','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🎋','🍃','🍂','🍁','🪺','🪹','🍄','🌾','💐','🌷','🌹','🥀','🪷','🌺','🌸','🌼','🌻','🌞','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥'],
  },
  {
    id: 'food', label: 'Food & Drink', icon: '🍔',
    emojis: ['🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🫘','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫔','🌮','🌯','🥙','🧆','🥘','🍲','🫕','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍙','🍚','🍘','🍥','🥮','🍡','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🍯','🧃','🥤','🧋','☕','🫖','🍵','🧉','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🧊'],
  },
  {
    id: 'travel', label: 'Travel & Places', icon: '✈️',
    emojis: ['🌍','🌎','🌏','🌐','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','⛩️','🕍','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🌌','🎠','🛝','🎡','🎢','🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🚤','🛥️','🛳️','⛴️','🚢','✈️','🛩️','🛫','🛬','🛰️','🚀','🛸','🚁','🛶','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋'],
  },
  {
    id: 'activities', label: 'Activities', icon: '⚽',
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','⛳','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','🤺','🏇','🤾','🏌️','🧘','🏄','🏊','🤽','🚴','🚵','🧗','🎯','🎱','🎲','🪄','🎮','🕹️','🎰','🧩','🎭','🎨','🖼️','🎪','🎤','🎧','🎼','🎵','🎶','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🪗','🎬'],
  },
  {
    id: 'objects', label: 'Objects', icon: '💡',
    emojis: ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💾','💿','📀','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🪫','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💰','💴','💵','💶','💷','💸','💳','🪙','💹','📈','📉','📊','📋','📌','📍','📎','🖇️','📐','📏','🧮','✂️','🗃️','🗄️','🗑️','🔒','🔓','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️','🛠️','🗡️','⚔️','🛡️','🪚','🔧','🪛','🔩','⚙️','🗜️','🔗','⛓️','🪝','🧲','🪜','🧰','🧪','🔬','🔭','📡','💊','💉','🩹','🩺','🩻','🚪','🛗','🪞','🪟','🛏️','🛋️','🚽','🪠','🚿','🛁','🧴','🧷','🧹','🧺','🧻','🪣','🧼','🫧','🪥','🧽','🧯','🛒','🚬','⚰️','🪦','⚱️','🧿','🪬','🗿','🪆','🧸','🎎','🎏','🎐','🎑','🎁','🎀','🎊','🎉','🎋','🎍'],
  },
  {
    id: 'symbols', label: 'Symbols', icon: '❤️',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❤️‍🔥','❤️‍🩹','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🔀','🔁','🔂','▶️','⏩','⏭️','⏯️','◀️','⏪','⏮️','🔼','⏫','🔽','⏬','⏸️','⏹️','⏺️','🎦','🔅','🔆','📶','🛜','📳','📴','♀️','♂️','⚧️','✖️','➕','➖','➗','🟰','♾️','‼️','⁉️','❓','❔','❕','❗','〰️','💱','💲','⚕️','♻️','⚜️','🔱','📛','🔰','⭕','✅','☑️','✔️','❌','❎','➰','➿','〽️','✳️','✴️','❇️','©️','®️','™️','🔞','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔷','🔶','🔹','🔸','🔲','🔳','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫'],
  },
  {
    id: 'flags', label: 'Flags', icon: '🏳️',
    emojis: ['🏳️','🏴','🚩','🏁','🏴‍☠️','🏳️‍🌈','🏳️‍⚧️','🇦🇫','🇦🇱','🇩🇿','🇦🇩','🇦🇴','🇦🇬','🇦🇷','🇦🇲','🇦🇺','🇦🇹','🇦🇿','🇧🇸','🇧🇭','🇧🇩','🇧🇧','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇨🇻','🇰🇭','🇨🇲','🇨🇦','🇨🇫','🇹🇩','🇨🇱','🇨🇳','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇨🇮','🇭🇷','🇨🇺','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇲','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇸🇿','🇪🇹','🇫🇯','🇫🇮','🇫🇷','🇬🇦','🇬🇲','🇬🇪','🇩🇪','🇬🇭','🇬🇷','🇬🇩','🇬🇹','🇬🇳','🇬🇼','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇱','🇮🇹','🇯🇲','🇯🇵','🇯🇴','🇰🇿','🇰🇪','🇰🇮','🇽🇰','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇮','🇱🇹','🇱🇺','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇭','🇲🇷','🇲🇺','🇲🇽','🇫🇲','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇷','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇰🇵','🇲🇰','🇳🇴','🇴🇲','🇵🇰','🇵🇼','🇵🇸','🇵🇦','🇵🇬','🇵🇾','🇵🇪','🇵🇭','🇵🇱','🇵🇹','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇰🇳','🇱🇨','🇻🇨','🇼🇸','🇸🇲','🇸🇹','🇸🇦','🇸🇳','🇷🇸','🇸🇱','🇸🇬','🇸🇰','🇸🇮','🇸🇧','🇸🇴','🇿🇦','🇸🇸','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇪','🇨🇭','🇸🇾','🇹🇼','🇹🇯','🇹🇿','🇹🇭','🇹🇱','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇹🇻','🇺🇬','🇺🇦','🇦🇪','🇬🇧','🏴󠁧󠁢󠁥󠁮󠁧󠁿','🏴󠁧󠁢󠁳󠁣󠁴󠁿','🏴󠁧󠁢󠁷󠁬󠁳󠁿','🇺🇸','🇺🇾','🇺🇿','🇻🇺','🇻🇪','🇻🇳','🇾🇪','🇿🇲','🇿🇼'],
  },
];

/* ── Keyword search index (module-level — never recreated) ───────────── */
const KEYWORD_MAP = {
  happy:   ['😀','😃','😄','😁','😊','🥰','😍','😎','🎉','🥳'],
  sad:     ['😢','😭','😔','😞','😟','🥺','💔','😿'],
  love:    ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','😍','🥰','💕','💞','💓','💗','💖','💘','💝','😘'],
  laugh:   ['😂','🤣','😆','😅','😹'],
  fire:    ['🔥','🌋','💥'],
  heart:   ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝'],
  ok:      ['👍','✅','☑️','✔️','👌'],
  no:      ['👎','❌','🚫','🙅'],
  hand:    ['👋','🤚','🖐️','✋','🖖','🤙','👌','✌️','🤞','👍','👎','✊','👊','👏','🙌','🤝','🙏'],
  party:   ['🎉','🎊','🥳','🎈','🎆','🎇','🎀','🎁'],
  money:   ['💰','💴','💵','💶','💷','💸','💳','🪙','💹','🤑'],
  star:    ['⭐','🌟','✨','💫','🌠','🏆','🥇','🥈','🥉'],
  sun:     ['☀️','🌤️','🌈','🌞','🌻'],
  moon:    ['🌙','🌛','🌜','🌝','🌚','🌑','🌕'],
  cry:     ['😢','😭','😿','💧','🥺'],
  angry:   ['😡','😠','🤬','👿','😤','💢'],
  think:   ['🤔','🧐','💭','🤨','😕'],
  wave:    ['👋','🌊'],
  clap:    ['👏','🎉','🙌'],
  thanks:  ['🙏','🤝','💕','❤️'],
  cool:    ['😎','🆒','🔥','✨'],
  wow:     ['😮','😲','🤩','😱','😯'],
  sick:    ['🤒','🤕','🤢','🤮','🤧','😷'],
  sleep:   ['😴','💤','🛌'],
  car:     ['🚗','🚕','🚙','🏎️'],
  plane:   ['✈️','🛫','🛬','🛩️'],
  music:   ['🎵','🎶','🎸','🎹','🎺','🥁','🎤','🎧','🎼'],
  book:    ['📚','📖','📝','✏️','📓'],
  phone:   ['📱','☎️','📞'],
  camera:  ['📷','📸','🎥','📹'],
  cake:    ['🎂','🍰','🧁'],
  pizza:   ['🍕'],
  coffee:  ['☕','🫖'],
  beer:    ['🍺','🍻'],
  dog:     ['🐶','🐩','🦮'],
  cat:     ['🐱','🐈','😺','😸'],
  flower:  ['🌸','🌺','🌹','🌷','💐','🌼','🌻'],
  tree:    ['🌲','🌳','🌴','🌵','🎄'],
  house:   ['🏠','🏡','🏘️'],
  time:    ['⏰','⌛','⏳','🕐','🕑','🕒'],
  check:   ['✅','☑️','✔️'],
  sparkle: ['✨','🌟','💫','⭐'],
  pakistan:['🇵🇰'],
  india:   ['🇮🇳'],
  usa:     ['🇺🇸'],
  uk:      ['🇬🇧'],
};

/* ── localStorage helpers ────────────────────────────────────────────── */
const RECENT_KEY = 'cc_recent_emojis';
const MAX_RECENT = 40;

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(emoji) {
  const list = getRecent().filter(e => e !== emoji);
  list.unshift(emoji);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

/* ── All emojis flat (module-level) ─────────────────────────────────── */
const ALL_EMOJIS = CATEGORIES.flatMap(c => c.emojis);

/* ── Component ───────────────────────────────────────────────────────── */
export default function EmojiPicker({ onSelect, onClose }) {
  const [search,  setSearch]  = useState('');
  const [active,  setActive]  = useState('smileys');
  const [recent,  setRecent]  = useState(getRecent);
  const bodyRef   = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const categories = useMemo(() => (
    CATEGORIES
      .map(c => c.id === 'recent' ? { ...c, emojis: recent } : c)
      .filter(c => c.emojis.length > 0)
  ), [recent]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const direct = ALL_EMOJIS.filter(e => e.startsWith(q));
    if (direct.length) return direct.slice(0, 80);
    for (const [kw, emojis] of Object.entries(KEYWORD_MAP)) {
      if (kw.startsWith(q) || q.startsWith(kw)) return emojis.slice(0, 80);
    }
    return CATEGORIES.find(c => c.id === 'smileys')?.emojis.slice(0, 80) ?? [];
  }, [search]);

  const pick = (emoji) => {
    saveRecent(emoji);
    setRecent(getRecent());
    onSelect(emoji);
  };

  const scrollToCategory = (id) => {
    setActive(id);
    const el = bodyRef.current?.querySelector(`[data-cat="${id}"]`);
    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!bodyRef.current) return;
    const containerTop = bodyRef.current.getBoundingClientRect().top;
    let current = null;
    for (const sec of bodyRef.current.querySelectorAll('[data-cat]')) {
      if (sec.getBoundingClientRect().top - containerTop <= 32) current = sec.dataset.cat;
    }
    if (current) setActive(current);
  };

  return (
    <div
      className="flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{ width: 340, height: 420, background: 'var(--surface)', border: '1px solid var(--border)' }}
      onMouseDown={e => e.preventDefault()}
    >
      {/* ── Search ── */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>🔍</span>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search emoji…"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--fg)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs transition-colors hover:opacity-70"
              style={{ color: 'var(--fg-muted)' }}
            >✕</button>
          )}
        </div>
      </div>

      {/* ── Category tabs ── */}
      {!search && (
        <div
          className="flex-shrink-0 flex items-center overflow-x-auto px-2 py-1 gap-0.5"
          style={{ borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              title={cat.label}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-base rounded-lg transition-all hover:scale-110"
              style={{
                background: active === cat.id ? 'rgba(109,92,255,0.15)' : 'transparent',
                outline: active === cat.id ? '1px solid rgba(109,92,255,0.4)' : 'none',
              }}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* ── Emoji grid ── */}
      <div
        ref={bodyRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 py-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
      >
        {search ? (
          <div>
            <p className="text-[10px] font-semibold px-1 py-1.5 sticky top-0 z-10" style={{ color: 'var(--fg-muted)', background: 'var(--surface)' }}>
              {searchResults?.length ? `${searchResults.length} results` : 'No results'}
            </p>
            <div className="grid grid-cols-8 gap-0.5">
              {searchResults?.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => pick(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all hover:scale-125 hover:bg-white/[0.08] active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} data-cat={cat.id} className="mb-2">
              <p
                className="text-[10px] font-semibold uppercase tracking-wider px-1 py-1.5 sticky top-0 z-10"
                style={{ color: 'var(--fg-muted)', background: 'var(--surface)' }}
              >
                {cat.label}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {cat.emojis.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => pick(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all hover:scale-125 hover:bg-white/[0.08] active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

EmojiPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose:  PropTypes.func,
};
