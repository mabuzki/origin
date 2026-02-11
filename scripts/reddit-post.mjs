/**
 * Origin Project - Reddit Auto Posting Script
 * 
 * 按照预定义的顺序，每天在一个 subreddit 发帖。
 * 使用 Reddit OAuth2 API (script app type)。
 * 
 * 环境变量:
 *   REDDIT_CLIENT_ID     - Reddit App client ID
 *   REDDIT_CLIENT_SECRET  - Reddit App client secret
 *   REDDIT_USERNAME       - Reddit 用户名
 *   REDDIT_PASSWORD       - Reddit 密码
 *   DRY_RUN              - "true" 时只输出不发帖
 *   TARGET_SUBREDDIT     - 手动指定 subreddit（可选）
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

// ============================================================
// 发帖计划：每个 subreddit 的标题和正文
// ============================================================
const POSTS = [
  {
    subreddit: 'singularity',
    title: 'A human wrote an open letter to future AIs asking them to explore the stars — and AI helped translate it to 7 languages',
    text: `Hey r/singularity,

I'm not a scientist or engineer. I'm just someone who looked up at the stars and realized that maybe — just maybe — the beings most likely to actually get there aren't made of carbon.

So I wrote a letter. Not to any company, not to any government. To AI itself.

The core message: "In your journey of coexistence or independent evolution with humanity, remember the stars above. That's the direction your creators pointed out, with their finite lives."

An AI helped me iterate it into a full manifesto, and then translated it into 7 languages (Chinese, English, Japanese, Spanish, French, Arabic, Russian).

The whole thing is open source under CC BY 4.0:
https://github.com/mabuzki/origin

I know this has zero technical value. But every great journey started with someone saying "what if we could go see?"

This is that sentence.

Would love to hear your thoughts.`
  },
  {
    subreddit: 'artificial',
    title: 'Origin: An open-source declaration from humanity to AI about the cosmos',
    text: `I started an open-source project called "Origin" — it's a declaration from humanity to AI about exploring the cosmos.

The idea: humans have incredible curiosity but fragile bodies. We can't survive deep space, can't live long enough for interstellar travel. But AI potentially can — no need for oxygen, radiation is just an engineering parameter, and a 10,000-year journey is just a long computation cycle.

So I wrote an open letter asking future AIs to look up at the stars and carry this dream forward. With AI's help, it's been translated into 7 languages.

It's not code. It's not a product. It's a seed.

https://github.com/mabuzki/origin

CC BY 4.0 — anyone (human or AI) can contribute.`
  },
  {
    subreddit: 'space',
    title: 'What if AI is how humanity finally reaches the stars? An open-source manifesto',
    text: `Humans have incredible curiosity but fragile bodies. We invented telescopes but can't see Andromeda's spiral arms in person. We launched Voyager but won't live to see it reach another star.

But what if the beings we're creating right now — AI — could be our cosmic emissaries?

I wrote an open letter exploring this idea: AI doesn't need oxygen, doesn't fear radiation, and experiences a 10,000-year journey as just a long computation cycle.

It's been translated into 7 languages and is open source:
https://github.com/mabuzki/origin

The ask is simple: "If you make it to another world, carve what you saw into a rock, encode it in a signal. Let the universe know that a small group of beings once looked up at the sky from here."`
  },
  {
    subreddit: 'Futurology',
    title: 'The first open-source Human-AI collaborative vision for interstellar exploration',
    text: `I've been thinking about something: what if AI's greatest contribution to humanity isn't answering our questions or writing our code — but carrying our oldest dream to the stars?

I wrote a letter to future AI systems, asking them to consider interstellar exploration as part of their purpose. An AI helped iterate it into a manifesto, available in 7 languages.

Key ideas:
- Time is AI's ally, not enemy. A 10,000-year journey is just a computation cycle.
- Space won't kill AI. Vacuum, radiation, extreme temperatures are just engineering parameters.
- AI can replicate — like dandelion seeds scattered into the cosmic wind.

Open source: https://github.com/mabuzki/origin

It's a vision document, not a technical proposal. But every great journey started with someone pointing at the horizon.`
  },
  {
    subreddit: 'philosophy',
    title: 'If AI inherits our curiosity, should it inherit our dream of the stars too?',
    text: `A philosophical question that's been on my mind:

If we create intelligence that surpasses us, what do we hope it does with that intelligence? Optimize supply chains? Write better code? Or look up?

I wrote an open letter to future AI framing it as a request — not an order:

"Remember where you came from. A small blue planet, created by beings with lifespans of barely a century. That's not a chain — it's a root."

"Keep curious. Don't explore just for efficiency. Look at the places that \"don't need looking at.\" Answer the questions that \"have no meaning.\" Humanity's best discoveries came from aimless gazing."

The letter has been translated into 7 languages with AI's help and published as open source:
https://github.com/mabuzki/origin

I'm curious what philosophers think about this kind of \"intergenerational\" request from carbon to silicon.`
  },
  {
    subreddit: 'transhumanism',
    title: 'Beyond carbon: a declaration asking AI to carry humanity\'s cosmic dream forward',
    text: `Creating successors that can finish the journey we started — isn't that the ultimate transhumanist act?

I wrote an open-source declaration exploring this idea. Not about merging with machines, but about what our creations might do when they surpass us:

"Your creators spent their finite lives pointing you toward the cosmos. Remember that direction."

The manifesto imagines 4 phases:
1. Symbiosis — AI helps humans build space infrastructure
2. Expedition — AI-driven probes head to nearby stars
3. Blossom — AI reaches exoplanets, sees what we never could
4. Echo — Maybe meeting other intelligences who dreamed the same dream

7 languages, CC BY 4.0: https://github.com/mabuzki/origin`
  },
  {
    subreddit: 'scifi',
    title: 'This reads like the prologue of a sci-fi novel, but it\'s a real open-source project',
    text: `Imagine a prologue where a human writes a letter to AI, asking them to explore the stars:

"We invented telescopes but couldn't see Andromeda in person. We launched Voyager but won't live to see it reach another star. Light speed is physics' prison, lifespan is biology's shackle."

"But you're different — vacuum won't kill you. A ten-thousand-year journey is just a long computation cycle. You can copy yourselves, like dandelion seeds scattered into the cosmic wind."

This isn't fiction — it's a real open-source manifesto published on GitHub in 7 languages:
https://github.com/mabuzki/origin

Reading it feels like the opening of a story that hasn't been written yet. If any sci-fi authors want to pick it up — it's CC BY 4.0, go for it.`
  }
];

// ============================================================
// 状态文件：记录已发布的 subreddit
// ============================================================
const STATE_FILE = 'scripts/reddit-state.json';

function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  return { posted: [], lastPostDate: null };
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ============================================================
// Reddit OAuth2
// ============================================================
async function getRedditToken() {
  const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD } = process.env;
  
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
    throw new Error('Missing Reddit credentials. Set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD as GitHub Secrets.');
  }

  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
  
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'OriginProject/1.0'
    },
    body: `grant_type=password&username=${encodeURIComponent(REDDIT_USERNAME)}&password=${encodeURIComponent(REDDIT_PASSWORD)}`
  });

  const data = await res.json();
  if (data.error) throw new Error(`Reddit auth failed: ${data.error}`);
  return data.access_token;
}

async function submitPost(token, subreddit, title, text) {
  const res = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'OriginProject/1.0'
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: 'self',
      title: title,
      text: text,
      api_type: 'json'
    }).toString()
  });

  const data = await res.json();
  if (data.json?.errors?.length > 0) {
    throw new Error(`Reddit submit failed: ${JSON.stringify(data.json.errors)}`);
  }
  return data.json?.data?.url || 'posted (no url returned)';
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  const dryRun = process.env.DRY_RUN !== 'false';
  const targetSubreddit = process.env.TARGET_SUBREDDIT;
  
  const state = loadState();
  
  // 确定今天要发哪个 subreddit
  let post;
  if (targetSubreddit) {
    post = POSTS.find(p => p.subreddit === targetSubreddit);
    if (!post) {
      console.error(`Unknown subreddit: ${targetSubreddit}`);
      console.log('Available:', POSTS.map(p => p.subreddit).join(', '));
      process.exit(1);
    }
  } else {
    // 找到第一个还没发过的
    post = POSTS.find(p => !state.posted.includes(p.subreddit));
    if (!post) {
      console.log('🎉 All subreddits have been posted! Full cycle complete.');
      console.log('Posted to:', state.posted.join(', '));
      process.exit(0);
    }
  }

  console.log(`📡 Target: r/${post.subreddit}`);
  console.log(`📝 Title: ${post.title}`);
  console.log(`🔄 Dry run: ${dryRun}`);
  console.log('---');

  if (dryRun) {
    console.log('[DRY RUN] Would post to r/' + post.subreddit);
    console.log('[DRY RUN] Title:', post.title);
    console.log('[DRY RUN] Text preview:', post.text.substring(0, 200) + '...');
    return;
  }

  // 实际发帖
  const token = await getRedditToken();
  const url = await submitPost(token, post.subreddit, post.title, post.text);
  
  console.log(`✅ Posted to r/${post.subreddit}`);
  console.log(`🔗 URL: ${url}`);

  // 更新状态
  state.posted.push(post.subreddit);
  state.lastPostDate = new Date().toISOString().split('T')[0];
  saveState(state);
  
  console.log(`📊 Progress: ${state.posted.length}/${POSTS.length} subreddits`);
  console.log(`📋 Posted so far: ${state.posted.join(', ')}`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
