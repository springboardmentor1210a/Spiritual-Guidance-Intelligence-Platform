import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { subscribeToUserReadings } from "../utils/readingsStorage";
import { Heart, Briefcase, Star, Compass, Brain, Zap, Sparkles } from "lucide-react";

// -- Advice generators — plain, direct, human ---------------------------------
// Each function receives aggregated signals and returns an array of advice strings.

function relationshipAdvice(signals) {
  const tips = [];
  const { heartCurvature, hasHeartLine, tarotConnection } = signals;

  if (hasHeartLine) {
    if (heartCurvature >= 12) {
      tips.push("You lead with your heart — but make sure you are also setting boundaries. Not everyone deserves that level of openness right away.");
      tips.push("Work on protecting your energy in close relationships. Giving too much too fast leaves you vulnerable.");
    } else {
      tips.push("Work on expressing your feelings earlier. Don't wait until things build up — say it when it's small.");
      tips.push("Trust takes time for you, and that is okay. But try opening up a little sooner with people who have earned it.");
    }
  }

  if (tarotConnection) {
    tips.push("Reach out to someone you've been meaning to reconnect with. A short message goes a long way.");
    tips.push("Invest real time in your closest relationships this week — put your phone down and be present.");
  }

  return tips;
}

function careerAdvice(signals) {
  const tips = [];
  const { fateConfidence, hasFateLine, tarotFocus, challengeScore } = signals;

  if (hasFateLine) {
    if (fateConfidence >= 75) {
      tips.push("You have a clear sense of direction — now you just need consistency. Show up every day, even when motivation is low.");
      tips.push("Stop second-guessing the path you are already on. Commit fully and execute.");
    } else {
      tips.push("Your career path is still taking shape — that is fine. Run small experiments: try a side project, a new skill, or a different role for 30 days.");
      tips.push("Don't wait for the perfect opportunity. Take the next available one and learn from it.");
    }
  }

  if (tarotFocus) {
    tips.push("Pick one professional goal right now and focus on it completely this month. Stop splitting your attention.");
  }

  if (challengeScore && challengeScore < 65) {
    tips.push("You are in a challenging phase at work. Slow down, ask for help, and don't try to push through alone.");
  }

  return tips;
}

function personalityAdvice(signals) {
  const tips = [];
  const { headCurvature, hasHeadLine, strengths, growthAreas } = signals;

  if (hasHeadLine) {
    if (headCurvature < 10) {
      tips.push("Your mind works best with structure. Build a daily review habit — even 5 minutes at the end of the day makes a difference.");
      tips.push("You are a natural planner. Use that strength: break your big goals into weekly actions.");
    } else {
      tips.push("Your thinking is creative and flexible. Channel that into something — writing, art, music, design. Don't let it just spin inside your head.");
      tips.push("You can overthink. When you notice yourself going in circles, stop and do something physical to reset.");
    }
  }

  if (strengths?.length) {
    tips.push(`You are genuinely good at: ${strengths.slice(0, 2).join(" and ").toLowerCase()}. Don't underplay these — actively lean into them.`);
  }

  if (growthAreas?.length) {
    const area = growthAreas[0]?.toLowerCase();
    if (area?.includes("direction") || area?.includes("clarity")) {
      tips.push("Start journaling daily. Write one sentence about what you want, and one about what is holding you back. Do this for two weeks.");
    } else if (area?.includes("boundary") || area?.includes("open")) {
      tips.push("Work on boundaries. Saying no is a complete sentence — you don't need to explain yourself every time.");
    } else {
      tips.push(`Work on ${area}. Start small — pick one thing this week that directly addresses it.`);
    }
  }

  return tips;
}

function personalGrowthAdvice(signals) {
  const tips = [];
  const { headCurvature, lifeLength, hasLifeLine } = signals;

  if (headCurvature < 10) {
    tips.push("Do structured reflection every Sunday. Review your week: what worked, what didn't, what you will change.");
    tips.push("Read something non-fiction for 20 minutes a day. Your mind absorbs analytical content well.");
  } else {
    tips.push("Start a creative practice — journaling, sketching, or free writing. Your growth happens through exploration, not rigid plans.");
    tips.push("Give yourself permission to follow curiosity without a destination. Some of your best ideas come from wandering.");
  }

  if (hasLifeLine && lifeLength >= 55) {
    tips.push("You have strong endurance. Use it on something that actually matters to you long-term, not just urgent tasks.");
  } else if (hasLifeLine) {
    tips.push("Protect your energy. You don't have to say yes to everything — be selective about where you put your effort.");
  }

  return tips;
}

function opportunitiesAdvice(signals) {
  const tips = [];
  const { lifeLength, hasLifeLine, opportunityScore } = signals;

  if (hasLifeLine) {
    if (lifeLength >= 55) {
      tips.push("Long-term commitments pay off for you. Don't abandon projects too early — you are built for the slow build.");
      tips.push("Pursue goals that take 6–12 months to show results. That's where your stamina becomes an advantage.");
    } else {
      tips.push("Work in shorter, focused sprints rather than long marathons. You perform better with clear end points.");
      tips.push("Take breaks on purpose — rest is part of how you stay productive, not a sign of weakness.");
    }
  }

  if (opportunityScore && opportunityScore >= 75) {
    tips.push("There is an opening in front of you right now — act on it this week before the window closes.");
  }

  return tips;
}

function focusAdvice(signals) {
  const tips = [];
  const { clarityScore, tarotFocusText } = signals;

  if (clarityScore && clarityScore < 65) {
    tips.push("Your mind feels scattered right now. Pick one thing — just one — and do not start anything else until it is done.");
    tips.push("Try a digital detox one evening this week. Clarity often comes when you stop consuming and start being still.");
  } else if (clarityScore >= 75) {
    tips.push("You have clarity right now — don't waste it. This is the time to act on things you have been putting off.");
  }

  if (!clarityScore) {
    tips.push("Write down your three most important tasks for this week. Do them before anything else, every single day.");
    tips.push("Block time on your calendar for deep work. Protect it like a meeting you cannot cancel.");
  }

  return tips;
}

// -- Signal extractor — pulls structured data from raw readings ---------------
function extractSignals(readings) {
  const signals = {
    heartCurvature: null, hasHeartLine: false,
    headCurvature: null, hasHeadLine: false,
    lifeLength: null, hasLifeLine: false,
    fateConfidence: null, hasFateLine: false,
    strengths: [], growthAreas: [],
    tarotConnection: false, tarotFocus: false, tarotFocusText: null,
    clarityScore: null, challengeScore: null, opportunityScore: null,
  };

  readings.forEach((r) => {
    const data = r.data || {};

    if (r.type === "palm") {
      const lines = data.lines || [];
      lines.forEach((line) => {
        const id = (line.id || line.name || "").toLowerCase();
        if (id.includes("heart")) {
          signals.hasHeartLine = true;
          signals.heartCurvature = line.attributes?.curvature ?? signals.heartCurvature;
        }
        if (id.includes("head")) {
          signals.hasHeadLine = true;
          signals.headCurvature = line.attributes?.curvature ?? signals.headCurvature;
        }
        if (id.includes("life")) {
          signals.hasLifeLine = true;
          signals.lifeLength = line.attributes?.length ?? signals.lifeLength;
        }
        if (id.includes("fate")) {
          signals.hasFateLine = true;
          signals.fateConfidence = line.confidence ?? signals.fateConfidence;
        }
      });

      const pi = data.personalityInsights || {};
      if (pi.strengths?.length) signals.strengths = [...signals.strengths, ...pi.strengths];
      if (pi.growthAreas?.length) signals.growthAreas = [...signals.growthAreas, ...pi.growthAreas];
    }

    if (r.type === "tarot") {
      const cats = data.categories || [];
      cats.forEach(({ label }) => {
        if (["Connection", "Relationships", "Tension"].includes(label)) signals.tarotConnection = true;
        if (["Focus", "Direction"].includes(label)) signals.tarotFocus = true;
      });
      const sc = data.scores || {};
      signals.clarityScore = sc.clarity ?? signals.clarityScore;
      signals.challengeScore = sc.challenge ?? signals.challengeScore;
      signals.opportunityScore = sc.opportunity ?? signals.opportunityScore;
    }
  });

  return signals;
}

// -- Topic config -------------------------------------------------------------
const TOPICS = [
  { key: "Relationships",   icon: Heart,     color: "text-rose-400",    gen: relationshipAdvice  },
  { key: "Career",          icon: Briefcase, color: "text-amber-400",   gen: careerAdvice        },
  { key: "Personality",     icon: Brain,     color: "text-violet-400",  gen: personalityAdvice   },
  { key: "Personal Growth", icon: Star,      color: "text-emerald-400", gen: personalGrowthAdvice},
  { key: "Opportunities",   icon: Zap,       color: "text-sky-400",     gen: opportunitiesAdvice },
  { key: "Focus",           icon: Compass,   color: "text-gold",        gen: focusAdvice         },
];

const priorityBadge = {
  High:   "bg-gold/10 text-gold border-gold/30",
  Medium: "bg-violet/10 text-violet border-violet/30",
  Low:    "bg-inkMuted/10 text-inkMuted border-inkMuted/30",
};

// -- Component -----------------------------------------------------------------
export default function Recommendations() {
  const { token, user } = useAuth();
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    if (!user?.uid) {
      setReadings([]);
      return;
    }
    const unsubscribe = subscribeToUserReadings(user.uid, (data) => {
      setReadings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
    return () => unsubscribe();
  }, [user]);

  const signals = extractSignals(readings);

  const topicsWithData = TOPICS.map(({ key, icon, color, gen }) => ({
    key, icon, color,
    items: gen(signals).filter(Boolean),
  })).filter((t) => t.items.length > 0);

  const isEmpty = readings.length === 0 || topicsWithData.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl mb-1">Recommendations</h1>
        <p className="text-inkMuted text-sm">
          Plain advice based on your readings — things you can actually act on.
        </p>
      </div>

      {isEmpty ? (
        <Card className="py-12 flex flex-col items-center gap-3 text-center">
          <Sparkles className="text-gold" size={32} />
          <p className="text-inkMuted text-sm max-w-xs">
            No recommendations yet. Complete a palm or tarot reading and your
            personalised advice will appear here by topic.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-10">
          {topicsWithData.map(({ key, icon: Icon, color, items }) => (
            <section key={key}>
              <div className="flex items-center gap-2 mb-4">
                <Icon size={18} className={color} />
                <h2 className="text-base font-semibold">{key}</h2>
                <span className="text-xs text-inkMuted ml-1">({items.length})</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {items.map((text, i) => (
                  <Card key={i} className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${priorityBadge[i === 0 ? "High" : "Medium"]}`}>
                        {i === 0 ? "High" : "Medium"} Priority
                      </span>
                    </div>
                    <p className="text-sm text-inkMuted leading-relaxed">{text}</p>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
