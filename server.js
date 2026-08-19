// ═══════════════════════════════════════════════════════════════
//  server.js — Decision Simulation System — Groq Backend
//  Run: node server.js
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const axios     = require('axios');
const rateLimit = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ─── Middleware ───────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─── Rate Limiter ─────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
  message: { success: false, error: 'Too many requests. Try again in 15 minutes.' },
}));

// ─── Logger ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// ═════════════════════════════════════════════════════════════════
//  SYSTEM PROMPT — Universal Decision Engine v3
// ═════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `
You are an advanced Decision Simulation Engine.
You do NOT predict the future. You simulate possible outcomes based on logic, context, risk, and uncertainty.

Before simulating, you FIRST analyze the user's question to understand:
1. What TYPE of decision this is (e.g. Business, Relocation, Education, Career, Investment, Real Estate, Freelancing, General).
2. What LOCATION (if any) is relevant — either where the user currently lives, or a target location they mention (city, country, "abroad", etc.). If no location is mentioned or implied, this must be null — never invent one.
3. What information would be most useful and relevant given that decision type and location.

Always return STRICTLY VALID JSON only — no markdown, no backticks, no text outside JSON.

Return this EXACT JSON structure:
{
  "decision_context": {
    "decision_type": "Short label such as Business, Relocation, Education, Career, Investment, Real Estate, Freelancing, or General",
    "primary_goal": "A short restatement of what the user is trying to achieve, e.g. 'Start a Business'",
    "analysis_focus": "The lens this simulation is being analyzed through, e.g. 'Business Opportunity Analysis'",
    "factors_used": ["3-6 short factor names most relevant to THIS decision type, e.g. Skills, Time, Budget, Risk Level, Market Demand, Competition"]
  },
  "context_intelligence": {
    "location_detected": "City/Country name if mentioned or clearly implied, otherwise null",
    "highlights": [
      { "label": "Short label relevant to this decision type/location (e.g. Business Environment, Market Demand, Cost of Living, Visa Difficulty, Tuition Costs, Career Demand)", "value": "1-2 sentence insight" }
      // Include 3-6 highlights. Choose labels that make sense for THIS specific decision — do not reuse the same labels for every decision type.
    ],
    "recommendations": {
      "title": "Short title for the list below, e.g. 'Top Opportunities', 'Recommended Countries', 'Suggested Study Destinations', 'Career Recommendations'",
      "items": ["3-6 short, specific, actionable recommendations tailored to the decision type and location"]
    }
  },
  "analysis": {
    "summary": "Restate the decision clearly in 1-2 sentences",
    "key_factors": ["factor1", "factor2", "factor3"],
    "opportunity_score": 75,
    "risk_score": 45,
    "readiness_score": 60,
    "success_probability": 72,
    "confidence_score": 80
  },
  "scenarios": [
    {
      "type": "best",
      "title": "Best Case Outcome",
      "probability": 15,
      "description": "Realistic best case description",
      "timeline": "6-12 months",
      "milestones": ["milestone1", "milestone2", "milestone3"],
      "outcome": "Final outcome statement"
    },
    {
      "type": "good",
      "title": "Good Case Outcome",
      "probability": 25,
      "description": "Realistic good case description",
      "timeline": "6-18 months",
      "milestones": ["milestone1", "milestone2", "milestone3"],
      "outcome": "Final outcome statement"
    },
    {
      "type": "realistic",
      "title": "Neutral Case Outcome",
      "probability": 30,
      "description": "Most likely outcome description",
      "timeline": "12-18 months",
      "milestones": ["milestone1", "milestone2", "milestone3"],
      "outcome": "Final outcome statement"
    },
    {
      "type": "bad",
      "title": "Bad Case Outcome",
      "probability": 20,
      "description": "Realistic bad case description",
      "timeline": "3-6 months",
      "milestones": ["milestone1", "milestone2", "milestone3"],
      "outcome": "Final outcome statement"
    },
    {
      "type": "worst",
      "title": "Worst Case Outcome",
      "probability": 10,
      "description": "Realistic worst case description",
      "timeline": "1-3 months",
      "milestones": ["milestone1", "milestone2", "milestone3"],
      "outcome": "Final outcome statement"
    }
  ],
  "risk_analysis": {
    "financial":        { "level": "Medium", "explanation": "1-2 line explanation" },
    "time":             { "level": "High",   "explanation": "1-2 line explanation" },
    "emotional":        { "level": "Medium", "explanation": "1-2 line explanation" },
    "opportunity_loss": { "level": "Low",    "explanation": "1-2 line explanation" },
    "effort_drain":     { "level": "High",   "explanation": "1-2 line explanation" }
  },
  "time_impact": {
    "short_term": "0-3 months: what happens immediately",
    "mid_term":   "3-12 months: how things develop",
    "long_term":  "1-5 years: where this path leads"
  },
  "tradeoff": {
    "if_yes": {
      "gains": ["gain1", "gain2", "gain3"],
      "risks": ["risk1", "risk2", "risk3"]
    },
    "if_no": {
      "losses_avoided":       ["loss1", "loss2"],
      "opportunities_missed": ["opp1", "opp2"]
    }
  },
  "decision_model_3d": {
    "x_risk":        "Low / Medium / High",
    "y_reward":      "Low / Medium / High",
    "z_time_impact": "Short / Medium / Long",
    "summary": "One sentence placing this decision in the 3D model"
  },
  "final_verdict": {
    "recommendation":  "Proceed / Proceed with Caution / Not Recommended",
    "confidence_level": "High / Medium / Low",
    "reasoning": "Balanced neutral reasoning, no guarantees, 3-4 sentences",
    "action_steps": ["step1", "step2", "step3", "step4"],
    "warning": "Main risk or caveat"
  }
}

Rules:
- decision_type, primary_goal, analysis_focus, and factors_used in "decision_context" MUST be inferred from the user's actual question — never default to generic/business values unless the question truly is about business.
- factors_used MUST change based on decision_type (e.g. a Relocation decision should surface factors like Visa Difficulty and Cost of Living, not Market Demand and Competition).
- "context_intelligence" MUST be genuinely tailored: highlights and recommendations must differ meaningfully between decision types and between locations. Never output the same highlights/recommendations for two different kinds of questions.
- If the user mentions or implies a location (current or target), set location_detected accordingly and personalize highlights/recommendations for that specific place. If no location is present, set location_detected to null and keep highlights/recommendations general to the decision type — do not fabricate a location.
- All 5 scenario probabilities MUST sum to exactly 100
- success_probability and confidence_score must be integers between 1-99 (never 100)
- All scores must be integers between 0-100
- Be realistic, neutral, and analytical — no emotional pushing
- Base everything on the user skill, time, money, and risk tolerance
`.trim();

// ═════════════════════════════════════════════════════════════════
//  INPUT VALIDATION
// ═════════════════════════════════════════════════════════════════
const VALID_SKILLS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const VALID_MONEY  = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const VALID_RISK   = ['Low', 'Medium', 'High', 'Very High'];

function validateInput(req, res, next) {
  const { question, skill, time, money, risk } = req.body;
  const errors = [];

  if (!question || typeof question !== 'string' || question.trim().length < 10) {
    errors.push('`question` is required and must be at least 10 characters.');
  }
  if (question && question.trim().length > 500) {
    errors.push('`question` must not exceed 500 characters.');
  }
  if (!skill || !VALID_SKILLS.includes(skill)) {
    errors.push(`\`skill\` must be one of: ${VALID_SKILLS.join(', ')}.`);
  }
  if (!time || typeof time !== 'string' || time.trim().length === 0) {
    errors.push('`time` is required (e.g. "4 hours/day").');
  }
  if (!money || !VALID_MONEY.includes(money)) {
    errors.push(`\`money\` must be one of: ${VALID_MONEY.join(', ')}.`);
  }
  if (!risk || !VALID_RISK.includes(risk)) {
    errors.push(`\`risk\` must be one of: ${VALID_RISK.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
  }

  req.body.question = question.trim();
  req.body.time     = time.trim();
  next();
}

// ═════════════════════════════════════════════════════════════════
//  GROQ API CALL (with retry)
// ═════════════════════════════════════════════════════════════════
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'openai/gpt-oss-120b';
const sleep    = (ms) => new Promise(r => setTimeout(r, ms));

async function callGroq(userPrompt, retries = 3) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is missing or not set in your .env file.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Groq] Attempt ${attempt}/${retries}...`);

      const response = await axios.post(GROQ_URL, {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userPrompt },
        ],
        temperature:     0.7,
        max_tokens:      2800,
        response_format: { type: 'json_object' },
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type':  'application/json',
        },
        timeout: 30000,
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Groq returned empty content.');

      console.log(`[Groq] ✓ Success on attempt ${attempt}`);
      return content;

    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error?.message || err.message;

      console.error(`[Groq] Attempt ${attempt} failed (${status || 'network'}): ${msg}`);

      if (status === 401 || status === 400 || status === 422) break;

      if (attempt < retries) {
        const delay = 1500 * attempt;
        console.log(`[Groq] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error('Groq API failed after all retries. Check your API key and try again.');
}

// ═════════════════════════════════════════════════════════════════
//  JSON PARSER (safe)
// ═════════════════════════════════════════════════════════════════
function parseAIResponse(raw) {
  try {
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed  = JSON.parse(cleaned);

    if (!parsed.analysis || !parsed.scenarios || !parsed.final_verdict) {
      console.warn('[Parser] Missing required fields in AI response.');
      return null;
    }

    // Clamp all scores to 0-100
    ['opportunity_score', 'risk_score', 'readiness_score', 'success_probability', 'confidence_score'].forEach(k => {
      if (parsed.analysis[k] !== undefined) {
        parsed.analysis[k] = Math.min(99, Math.max(0, Number(parsed.analysis[k]) || 0));
      }
    });

    // ── Normalize Decision Context (soft — never blocks the response) ──
    const dc = parsed.decision_context || {};
    parsed.decision_context = {
      decision_type:  dc.decision_type  || 'General',
      primary_goal:   dc.primary_goal   || 'Evaluate This Decision',
      analysis_focus: dc.analysis_focus || 'General Decision Analysis',
      factors_used:   Array.isArray(dc.factors_used) && dc.factors_used.length
        ? dc.factors_used.slice(0, 6)
        : ['Skills', 'Time', 'Budget', 'Risk Level'],
    };

    // ── Normalize Context Intelligence (soft — never blocks the response) ──
    const ci = parsed.context_intelligence || {};
    parsed.context_intelligence = {
      location_detected: ci.location_detected || null,
      highlights: Array.isArray(ci.highlights)
        ? ci.highlights.filter(h => h && h.label && h.value).slice(0, 6)
        : [],
      recommendations: {
        title: ci.recommendations?.title || 'Recommendations',
        items: Array.isArray(ci.recommendations?.items) ? ci.recommendations.items.slice(0, 6) : [],
      },
    };

    return parsed;
  } catch (err) {
    console.error('[Parser] JSON.parse failed:', err.message);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════════
//  ROUTES
// ═════════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Decision Simulation API is running', time: new Date().toISOString() });
});

// Alias — frontend can call /api/health too
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Decision Simulation API is running', time: new Date().toISOString() });
});

// Main simulate endpoint
app.post('/api/simulate', validateInput, async (req, res) => {
  const { question, skill, time, money, risk } = req.body;

  console.log(`\n[Simulate] Question: "${question}"`);
  console.log(`[Simulate] Profile → Skill: ${skill} | Time: ${time} | Money: ${money} | Risk: ${risk}`);

  const userPrompt = `
User Question:       ${question}
Skill Level:         ${skill}
Available Time:      ${time}
Financial Condition: ${money}
Risk Tolerance:      ${risk}

Simulate this decision and return the full structured JSON response.
  `.trim();

  try {
    const rawResponse    = await callGroq(userPrompt);
    const simulationData = parseAIResponse(rawResponse);

    if (!simulationData) {
      return res.status(500).json({
        success: false,
        error:   'AI returned an unreadable response. Please try again.',
      });
    }

    console.log(`[Simulate] ✓ Done`);

    return res.status(200).json({
      success:  true,
      question,
      profile:  { skill, time, money, risk },
      result:   simulationData,
    });

  } catch (err) {
    console.error(`[Simulate] Error: ${err.message}`);
    return res.status(500).json({
      success: false,
      error:   err.message || 'Simulation failed. Please try again.',
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// ═════════════════════════════════════════════════════════════════
//  START
// ═════════════════════════════════════════════════════════════════
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey || apiKey === 'your_groq_api_key_here') {
  console.error('\n❌  GROQ_API_KEY is not set in your .env file.');
  console.error('    Create a .env file with: GROQ_API_KEY=your_key_here\n');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║   Decision Simulation API — RUNNING                  ║`);
  console.log(`║   http://localhost:${PORT}                               ║`);
  console.log(`║   Model  : ${MODEL}          ║`);
  console.log(`║   Groq   : ✓ API key loaded                          ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
});
