"""
Milestone 3 Intelligence Demo Profiles

Purpose
-------
Provides structured demo intelligence profiles for:

1. AI Interpretation
2. Personality Intelligence
3. Personalized Recommendations
4. Life Trend Analysis
5. Personalized Dashboard

IMPORTANT
---------
These profiles are structured demo intelligence data.

They are NOT:
- a trained ML model
- a medical prediction system
- a psychological diagnosis
- a guaranteed future prediction

The structure is intentionally designed so that a future
ML/LLM layer can replace or enrich these values without
changing the overall Milestone 3 architecture.

Life Trend Enhancement
----------------------
Each life-trend category now contains:

- direction
- score
- path
- past_score
- present_score
- change
- comparison
- chart_data

This allows the frontend to render:

1. Current trend cards
2. Past vs present comparison graphs
3. Trend progression line graphs
4. Change indicators

The historical values in this demo are illustrative profile
comparison values and should not be presented as real historical
measurements.
"""


# ============================================================
# PROFILE 1
# ============================================================

REFLECTIVE_BALANCE = {
    "id": "reflective_balance",
    "name": "Reflective & Balanced",

    # ========================================================
    # AI INTERPRETATION
    # ========================================================

    "overview": (
        "Your reading emphasizes thoughtful decisions, emotional awareness, "
        "consistency, and gradual personal development. The overall pattern "
        "favors understanding priorities clearly and turning reflection into "
        "practical action."
    ),

    "personality": (
        "You appear reflective and balanced, combining practical thinking "
        "with intuition. You may prefer to understand a situation carefully "
        "before making important decisions."
    ),

    "relationships": (
        "The reading emphasizes clear communication, emotional steadiness, "
        "and reciprocal boundaries. Stable relationships can benefit from "
        "expressing expectations directly."
    ),

    "career": (
        "Consistent effort and meaningful responsibility are highlighted. "
        "Gradual skill development and dependable progress are emphasized "
        "more strongly than sudden change."
    ),

    "finance": (
        "A structured approach to financial decisions is emphasized. "
        "Planning priorities and avoiding unnecessary impulsive choices "
        "can support stability."
    ),

    "health_wellness": (
        "Balance between activity, rest, and emotional wellbeing is "
        "emphasized. Sustainable routines and adequate recovery are useful "
        "foundations."
    ),

    "personal_growth": (
        "Reflection becomes most valuable when it leads to action. "
        "Small, repeatable improvements can help turn insight into "
        "meaningful progress."
    ),

    "life_opportunities": (
        "Opportunities may become easier to recognize when priorities are "
        "clearly defined. Preparation and awareness can help you notice "
        "options aligned with your direction."
    ),

    "key_themes": [
        "Thoughtful decision-making",
        "Emotional awareness",
        "Consistency",
        "Practical progress",
        "Self-reflection",
    ],

    "dominant_patterns": [
        {
            "title": "Reflection before action",
            "description": (
                "You may prefer to understand a situation thoroughly "
                "before committing to a direction."
            ),
        },
        {
            "title": "Preference for stability",
            "description": (
                "Consistent routines and dependable progress may feel "
                "more sustainable than frequent unpredictable changes."
            ),
        },
        {
            "title": "Practical application",
            "description": (
                "Insight becomes more useful when it is translated into "
                "specific actions and measurable improvements."
            ),
        },
    ],

    "areas_to_reflect": [
        "Where might careful thinking be turning into unnecessary overthinking?",
        "Which insight could be converted into one concrete action?",
        "Where would clearer communication reduce uncertainty?",
    ],

    "synthesis": (
        "Across personality, relationships, career, and personal growth, "
        "the strongest common pattern is deliberate progress. Reflection "
        "appears most useful when paired with consistent action and clear "
        "priorities."
    ),

    # ========================================================
    # PERSONALITY INTELLIGENCE
    # ========================================================

    "personality_profile": {
        "type": "Reflective Decision Maker",

        "dimensions": {
            "Emotional Awareness": 88,
            "Practical Thinking": 86,
            "Intuition": 78,
            "Adaptability": 72,
            "Communication": 84,
            "Consistency": 91,
            "Self-Reflection": 90,
        },

        "strengths": [
            "Thoughtful decision-making",
            "Emotional awareness",
            "Consistent effort",
            "Practical planning",
        ],

        "development_areas": [
            "Avoid overthinking",
            "Turn reflection into action",
            "Stay flexible when circumstances change",
            "Communicate expectations clearly",
        ],

        "summary": (
            "A reflective and structured profile that balances practical "
            "reasoning with intuition. The strongest development opportunity "
            "is converting reflection into consistent action."
        ),

        "behavioral_insights": {
            "decision_making": (
                "You may prefer gathering enough information before "
                "making important decisions. A useful balance is to "
                "define a decision point so analysis does not continue "
                "indefinitely."
            ),
            "interaction_style": (
                "You may value calm, honest and predictable communication. "
                "Clear expectations can help maintain stable interactions."
            ),
            "work_style": (
                "You may perform well when responsibilities are clearly "
                "defined and progress can be tracked consistently."
            ),
            "growth_style": (
                "Development may work best through reflection followed "
                "by small, measurable actions."
            ),
        },

        "dominant_traits": [
            "Consistency",
            "Self-reflection",
            "Practical thinking",
        ],

        "development_focus": {
            "focus": "Reflection into action",
            "current_tendency": (
                "Careful analysis and reflection are strong parts of "
                "the profile."
            ),
            "growth_direction": (
                "Convert insights into smaller decisions and repeatable "
                "actions."
            ),
            "reflection_question": (
                "What is one decision you already understand well enough "
                "to act on?"
            ),
        },
    },

    # ========================================================
    # RECOMMENDATIONS
    # ========================================================

    "recommendations": [
        {
            "area": "Career",
            "title": "Strengthen one core skill",
            "description": (
                "Choose one important skill and build depth through "
                "consistent practice."
            ),
            "action": (
                "Schedule focused weekly practice and track progress."
            ),
            "why_it_matters": (
                "Consistent skill development can create stronger "
                "long-term capability."
            ),
            "priority": "High",
            "time_horizon": "Near term",
            "goal_alignment": "Career development",
        },
        {
            "area": "Relationships",
            "title": "Use direct communication",
            "description": (
                "Clarify expectations instead of relying on assumptions."
            ),
            "action": (
                "Discuss important expectations early and clearly."
            ),
            "why_it_matters": (
                "Clear communication can reduce avoidable uncertainty "
                "in relationships."
            ),
            "priority": "High",
            "time_horizon": "Ongoing",
            "goal_alignment": "Relationship stability",
        },
        {
            "area": "Personal Growth",
            "title": "Turn insight into action",
            "description": (
                "Convert reflection into one measurable improvement "
                "at a time."
            ),
            "action": (
                "Choose one weekly growth action and complete it."
            ),
            "why_it_matters": (
                "Action allows reflection to become observable progress."
            ),
            "priority": "High",
            "time_horizon": "Near term",
            "goal_alignment": "Personal development",
        },
        {
            "area": "Finance",
            "title": "Plan before spending",
            "description": (
                "Use priorities and simple planning for non-essential "
                "decisions."
            ),
            "action": (
                "Review priorities before discretionary purchases."
            ),
            "why_it_matters": (
                "Planning can make financial decisions more deliberate."
            ),
            "priority": "Medium",
            "time_horizon": "Ongoing",
            "goal_alignment": "Financial stability",
        },
        {
            "area": "Spiritual Development",
            "title": "Create a reflection routine",
            "description": (
                "Use quiet reflection to review decisions, priorities "
                "and personal direction."
            ),
            "action": (
                "Set aside a short weekly period for structured reflection."
            ),
            "why_it_matters": (
                "A consistent reflection practice can support self-awareness."
            ),
            "priority": "Medium",
            "time_horizon": "Ongoing",
            "goal_alignment": "Self-awareness",
        },
    ],

    "recommendation_summary": (
        "The strongest recommendation pattern is to combine reflection "
        "with practical execution. Small consistent actions are likely "
        "to be more useful than attempting several major changes at once."
    ),

    "goal_alignment": [
        "Build consistent skills",
        "Improve communication",
        "Maintain financial structure",
        "Convert reflection into action",
    ],

    "reflection_questions": [
        "What is one area where you want clearer direction?",
        "Which habit would create the greatest practical improvement?",
        "Where could you replace overthinking with a small experiment?",
    ],

    # ========================================================
    # LIFE TRENDS
    #
    # IMPORTANT:
    # Existing fields direction / score / path remain unchanged.
    #
    # New fields:
    # past_score
    # present_score
    # change
    # comparison
    # chart_data
    #
    # These are illustrative comparison values.
    # ========================================================

    "life_trends": {
        "current_phase": "Reflection & Stabilization",

        "career": {
            "direction": "Skill Development",
            "score": 82,
            "path": "Consistency → Expertise → Opportunity",

            "past_score": 68,
            "present_score": 82,
            "change": 14,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 68,
                "present_score": 82,
                "change": 14,
                "change_label": "+14 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 64},
                {"period": "Developing", "score": 71},
                {"period": "Recent", "score": 77},
                {"period": "Current", "score": 82},
            ],
        },

        "relationships": {
            "direction": "Communication & Stability",
            "score": 80,
            "path": "Clarity → Trust → Stronger Connections",

            "past_score": 69,
            "present_score": 80,
            "change": 11,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 69,
                "present_score": 80,
                "change": 11,
                "change_label": "+11 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 66},
                {"period": "Developing", "score": 70},
                {"period": "Recent", "score": 76},
                {"period": "Current", "score": 80},
            ],
        },

        "personal_growth": {
            "direction": "Reflection to Action",
            "score": 88,
            "path": "Awareness → Action → Consistency",

            "past_score": 72,
            "present_score": 88,
            "change": 16,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 72,
                "present_score": 88,
                "change": 16,
                "change_label": "+16 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 67},
                {"period": "Developing", "score": 75},
                {"period": "Recent", "score": 82},
                {"period": "Current", "score": 88},
            ],
        },

        "opportunities": {
            "direction": "Prepared Recognition",
            "score": 79,
            "path": "Preparation → Awareness → Opportunity",

            "past_score": 63,
            "present_score": 79,
            "change": 16,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 63,
                "present_score": 79,
                "change": 16,
                "change_label": "+16 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 60},
                {"period": "Developing", "score": 68},
                {"period": "Recent", "score": 74},
                {"period": "Current", "score": 79},
            ],
        },

        "summary": (
            "The current pattern emphasizes gradual development rather "
            "than sudden transformation. Strong foundations and consistent "
            "action are the dominant themes."
        ),
    },

    "life_trend_analysis": {
        "challenge_signals": [
            {
                "title": "Overthinking",
                "level": "Moderate",
                "description": (
                    "Extended analysis may occasionally delay practical action."
                ),
            },
            {
                "title": "Resistance to sudden change",
                "level": "Moderate",
                "description": (
                    "Unexpected changes may require additional adjustment time."
                ),
            },
        ],

        "growth_potential": {
            "score": 85,
            "label": "Steady Development",
            "description": (
                "The combined trend signals indicate strong potential "
                "for gradual development through consistency and deliberate action."
            ),
        },

        "life_path": {
            "direction": "Build → Strengthen → Expand",
            "description": (
                "The current pattern favors strengthening existing "
                "foundations before pursuing larger changes."
            ),
        },

        "monitoring_summary": (
            "Monitor consistency, decision confidence and the transition "
            "from reflection into measurable action."
        ),
    },
}


# ============================================================
# PROFILE 2
# ============================================================

AMBITIOUS_GROWTH = {
    "id": "ambitious_growth",
    "name": "Ambitious & Growth-Oriented",

    # ========================================================
    # AI INTERPRETATION
    # ========================================================

    "overview": (
        "Your reading emphasizes ambition, purposeful growth, responsibility, "
        "and learning through challenges. Progress is associated with clear "
        "goals and steadily expanding capability."
    ),

    "personality": (
        "You show a goal-oriented style with a preference for progress and "
        "meaningful challenges. Motivation can increase when goals are "
        "measurable."
    ),

    "relationships": (
        "The reading values loyalty, honesty, and relationships that support "
        "mutual development. Healthy boundaries can protect long-term "
        "stability."
    ),

    "career": (
        "Learning, leadership, responsibility, and skill expansion are "
        "emphasized. Taking ownership of meaningful work can support "
        "continued development."
    ),

    "finance": (
        "Long-term planning and disciplined choices are emphasized. "
        "Clear financial priorities can help support ambitious goals."
    ),

    "health_wellness": (
        "A sustainable routine can help maintain high levels of activity. "
        "Recovery is important when pursuing demanding goals."
    ),

    "personal_growth": (
        "Growth is connected with leaving familiar patterns and deliberately "
        "learning from challenges. Measurable goals can turn motivation "
        "into progress."
    ),

    "life_opportunities": (
        "New possibilities may appear through learning, responsibility, "
        "and purposeful change. Preparation can make ambitious opportunities "
        "easier to use effectively."
    ),

    "key_themes": [
        "Ambition",
        "Leadership",
        "Goal orientation",
        "Learning through challenge",
        "Capability expansion",
    ],

    "dominant_patterns": [
        {
            "title": "Goal-driven progress",
            "description": (
                "Clear measurable objectives can provide strong motivation."
            ),
        },
        {
            "title": "Learning through responsibility",
            "description": (
                "Taking ownership of meaningful tasks may accelerate development."
            ),
        },
        {
            "title": "Expansion mindset",
            "description": (
                "Challenges may be interpreted as opportunities to develop "
                "new capabilities."
            ),
        },
    ],

    "areas_to_reflect": [
        "Are your current goals specific enough to measure?",
        "Where could ambition be creating unnecessary pressure?",
        "Which responsibility would provide the most useful learning?",
    ],

    "synthesis": (
        "The strongest common pattern connects ambition, responsibility "
        "and continuous learning. Sustainable progress depends on balancing "
        "high goals with recovery and reflection."
    ),

    # ========================================================
    # PERSONALITY INTELLIGENCE
    # ========================================================

    "personality_profile": {
        "type": "Growth-Oriented Achiever",

        "dimensions": {
            "Emotional Awareness": 76,
            "Practical Thinking": 84,
            "Intuition": 70,
            "Adaptability": 86,
            "Communication": 82,
            "Consistency": 85,
            "Self-Reflection": 78,
        },

        "strengths": [
            "Goal orientation",
            "Leadership potential",
            "Learning mindset",
            "Responsibility",
        ],

        "development_areas": [
            "Avoid overextension",
            "Allow recovery",
            "Balance ambition with reflection",
            "Stay open to alternative approaches",
        ],

        "summary": (
            "A goal-oriented profile driven by progress and meaningful "
            "challenges. Sustainable growth comes from balancing ambition "
            "with recovery and reflection."
        ),

        "behavioral_insights": {
            "decision_making": (
                "You may prefer decisions that clearly contribute to a "
                "larger goal and measurable outcome."
            ),
            "interaction_style": (
                "You may value direct, honest relationships where both "
                "people encourage development."
            ),
            "work_style": (
                "You may be energized by ownership, challenges and "
                "visible progress."
            ),
            "growth_style": (
                "You may develop strongly when challenges are converted "
                "into structured learning goals."
            ),
        },

        "dominant_traits": [
            "Goal orientation",
            "Adaptability",
            "Consistency",
        ],

        "development_focus": {
            "focus": "Sustainable ambition",
            "current_tendency": (
                "Strong motivation may encourage continuous pursuit "
                "of increasingly ambitious goals."
            ),
            "growth_direction": (
                "Balance achievement with recovery, reflection and "
                "realistic capacity."
            ),
            "reflection_question": (
                "Which goal deserves focused effort without requiring "
                "you to overextend?"
            ),
        },
    },

    # ========================================================
    # RECOMMENDATIONS
    # ========================================================

    "recommendations": [
        {
            "area": "Career",
            "title": "Build leadership depth",
            "description": (
                "Take ownership of a meaningful responsibility and develop "
                "expertise around it."
            ),
            "action": (
                "Lead one defined task or project and document what you learn."
            ),
            "why_it_matters": (
                "Responsibility can create opportunities to develop "
                "leadership and technical capability."
            ),
            "priority": "High",
            "time_horizon": "Near term",
            "goal_alignment": "Career growth",
        },
        {
            "area": "Personal Growth",
            "title": "Set measurable goals",
            "description": (
                "Convert broad ambitions into smaller milestones."
            ),
            "action": (
                "Define one monthly target with weekly checkpoints."
            ),
            "why_it_matters": (
                "Measurable milestones make progress easier to monitor."
            ),
            "priority": "High",
            "time_horizon": "Near term",
            "goal_alignment": "Achievement",
        },
        {
            "area": "Relationships",
            "title": "Protect mutual growth",
            "description": (
                "Build relationships around honesty, support and clear boundaries."
            ),
            "action": (
                "Discuss expectations and long-term priorities openly."
            ),
            "why_it_matters": (
                "Mutual understanding can support more stable relationships."
            ),
            "priority": "Medium",
            "time_horizon": "Ongoing",
            "goal_alignment": "Relationship stability",
        },
        {
            "area": "Wellness",
            "title": "Protect recovery time",
            "description": (
                "High activity is more sustainable when recovery is planned."
            ),
            "action": (
                "Reserve regular rest periods in your weekly schedule."
            ),
            "why_it_matters": (
                "Recovery helps maintain sustainable effort."
            ),
            "priority": "High",
            "time_horizon": "Immediate",
            "goal_alignment": "Sustainable performance",
        },
        {
            "area": "Spiritual Development",
            "title": "Reflect on achievement",
            "description": (
                "Use reflection to understand why particular goals matter."
            ),
            "action": (
                "Review one major goal and its underlying purpose each month."
            ),
            "why_it_matters": (
                "Purpose can help keep ambition aligned with personal values."
            ),
            "priority": "Medium",
            "time_horizon": "Monthly",
            "goal_alignment": "Purpose",
        },
    ],

    "recommendation_summary": (
        "The recommendation pattern emphasizes purposeful ambition. "
        "The strongest results come from combining measurable goals, "
        "responsibility and sufficient recovery."
    ),

    "goal_alignment": [
        "Leadership development",
        "Skill expansion",
        "Goal achievement",
        "Sustainable performance",
    ],

    "reflection_questions": [
        "Which goal has the strongest long-term value?",
        "Where do you need more recovery?",
        "What responsibility could teach you the most?",
    ],

    # ========================================================
    # LIFE TRENDS
    # ========================================================

    "life_trends": {
        "current_phase": "Active Development",

        "career": {
            "direction": "Leadership & Skill Expansion",
            "score": 90,
            "path": "Learning → Responsibility → Leadership",

            "past_score": 74,
            "present_score": 90,
            "change": 16,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 74,
                "present_score": 90,
                "change": 16,
                "change_label": "+16 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 69},
                {"period": "Developing", "score": 76},
                {"period": "Recent", "score": 84},
                {"period": "Current", "score": 90},
            ],
        },

        "relationships": {
            "direction": "Mutual Growth",
            "score": 78,
            "path": "Honesty → Support → Stability",

            "past_score": 68,
            "present_score": 78,
            "change": 10,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 68,
                "present_score": 78,
                "change": 10,
                "change_label": "+10 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 64},
                {"period": "Developing", "score": 69},
                {"period": "Recent", "score": 74},
                {"period": "Current", "score": 78},
            ],
        },

        "personal_growth": {
            "direction": "Challenge & Expansion",
            "score": 87,
            "path": "Challenge → Learning → Growth",

            "past_score": 70,
            "present_score": 87,
            "change": 17,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 70,
                "present_score": 87,
                "change": 17,
                "change_label": "+17 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 66},
                {"period": "Developing", "score": 74},
                {"period": "Recent", "score": 81},
                {"period": "Current", "score": 87},
            ],
        },

        "opportunities": {
            "direction": "Purposeful Change",
            "score": 86,
            "path": "Preparation → Initiative → Opportunity",

            "past_score": 71,
            "present_score": 86,
            "change": 15,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 71,
                "present_score": 86,
                "change": 15,
                "change_label": "+15 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 67},
                {"period": "Developing", "score": 73},
                {"period": "Recent", "score": 81},
                {"period": "Current", "score": 86},
            ],
        },

        "summary": (
            "The current pattern emphasizes active development. Progress "
            "is associated with purposeful challenges, learning, and "
            "responsible ownership."
        ),
    },

    "life_trend_analysis": {
        "challenge_signals": [
            {
                "title": "Overextension",
                "level": "Moderate",
                "description": (
                    "Pursuing multiple demanding goals simultaneously "
                    "may reduce sustainability."
                ),
            },
            {
                "title": "Performance pressure",
                "level": "Moderate",
                "description": (
                    "Strong expectations may make recovery and reflection "
                    "feel less important."
                ),
            },
        ],

        "growth_potential": {
            "score": 88,
            "label": "High Development Potential",
            "description": (
                "The current pattern contains strong signals around "
                "learning, responsibility and purposeful growth."
            ),
        },

        "life_path": {
            "direction": "Challenge → Capability → Leadership",
            "description": (
                "Taking on meaningful challenges can create opportunities "
                "to build capability and responsibility."
            ),
        },

        "monitoring_summary": (
            "Monitor workload, recovery, goal completion and whether "
            "ambition remains aligned with meaningful priorities."
        ),
    },
}


# ============================================================
# PROFILE 3
# ============================================================

INTUITIVE_CREATIVE = {
    "id": "intuitive_creative",
    "name": "Intuitive & Creative",

    # ========================================================
    # AI INTERPRETATION
    # ========================================================

    "overview": (
        "Your reading emphasizes intuition, imagination, emotional connection, "
        "and creative exploration. The strongest theme is combining new ideas "
        "with enough structure to turn them into practical outcomes."
    ),

    "personality": (
        "You appear intuitive and imaginative, often noticing possibilities "
        "that may not be immediately obvious. Creative thinking can be a "
        "strong source of problem-solving."
    ),

    "relationships": (
        "Emotional connection and genuine understanding are emphasized. "
        "Open conversations can help translate feelings and expectations "
        "into clearer relationships."
    ),

    "career": (
        "Creative problem-solving and meaningful work are highlighted. "
        "Combining creativity with practical planning can help ideas become "
        "useful results."
    ),

    "finance": (
        "Creativity can be balanced with structure by keeping financial "
        "decisions planned and deliberate."
    ),

    "health_wellness": (
        "Emotional balance, recovery, and time away from constant stimulation "
        "are emphasized. A flexible but consistent routine can help."
    ),

    "personal_growth": (
        "Self-awareness can help convert intuition into practical action. "
        "Experimentation is most useful when followed by reflection."
    ),

    "life_opportunities": (
        "New possibilities may emerge when creativity is combined with "
        "preparation. Exploring unfamiliar approaches can reveal useful "
        "directions."
    ),

    "key_themes": [
        "Creativity",
        "Intuition",
        "Emotional awareness",
        "Exploration",
        "Adaptability",
    ],

    "dominant_patterns": [
        {
            "title": "Idea generation",
            "description": (
                "You may naturally notice alternative possibilities "
                "and unconventional approaches."
            ),
        },
        {
            "title": "Emotional sensitivity",
            "description": (
                "Emotional awareness may strongly influence how situations "
                "and relationships are interpreted."
            ),
        },
        {
            "title": "Exploration",
            "description": (
                "Experimentation may be an important part of discovering "
                "what works."
            ),
        },
    ],

    "areas_to_reflect": [
        "Which idea deserves to become a practical experiment?",
        "Where could stronger structure help your creativity?",
        "Which feelings would benefit from clearer communication?",
    ],

    "synthesis": (
        "The strongest cross-domain pattern combines creativity, intuition "
        "and emotional awareness. Structure and follow-through can help "
        "translate these strengths into practical outcomes."
    ),

    # ========================================================
    # PERSONALITY INTELLIGENCE
    # ========================================================

    "personality_profile": {
        "type": "Creative Intuitive",

        "dimensions": {
            "Emotional Awareness": 91,
            "Practical Thinking": 70,
            "Intuition": 94,
            "Adaptability": 88,
            "Communication": 79,
            "Consistency": 68,
            "Self-Reflection": 86,
        },

        "strengths": [
            "Creativity",
            "Intuition",
            "Emotional awareness",
            "Adaptability",
        ],

        "development_areas": [
            "Add structure to ideas",
            "Maintain consistency",
            "Balance intuition with evidence",
            "Finish what you start",
        ],

        "summary": (
            "A creative and intuitive profile with strong adaptability and "
            "emotional awareness. Structure and follow-through can help "
            "convert ideas into outcomes."
        ),

        "behavioral_insights": {
            "decision_making": (
                "You may notice possibilities quickly and benefit from "
                "combining intuitive impressions with practical checks."
            ),
            "interaction_style": (
                "You may value emotional understanding and authentic "
                "communication in relationships."
            ),
            "work_style": (
                "You may thrive when given room to explore ideas while "
                "having a simple structure for execution."
            ),
            "growth_style": (
                "Experimentation followed by reflection can help convert "
                "creative exploration into learning."
            ),
        },

        "dominant_traits": [
            "Intuition",
            "Emotional awareness",
            "Adaptability",
        ],

        "development_focus": {
            "focus": "Structure creative thinking",
            "current_tendency": (
                "Ideas and possibilities may appear faster than they "
                "can be organized."
            ),
            "growth_direction": (
                "Use lightweight planning to move promising ideas "
                "toward completion."
            ),
            "reflection_question": (
                "Which current idea deserves one concrete next step?"
            ),
        },
    },

    # ========================================================
    # RECOMMENDATIONS
    # ========================================================

    "recommendations": [
        {
            "area": "Career",
            "title": "Use creative problem-solving",
            "description": (
                "Explore multiple approaches before settling on a solution."
            ),
            "action": (
                "Keep an idea list and test one promising approach each week."
            ),
            "why_it_matters": (
                "Experimentation can turn creative thinking into useful solutions."
            ),
            "priority": "High",
            "time_horizon": "Near term",
            "goal_alignment": "Career creativity",
        },
        {
            "area": "Personal Growth",
            "title": "Pair intuition with planning",
            "description": (
                "Give creative insights a simple execution structure."
            ),
            "action": (
                "For each idea, define one concrete next step."
            ),
            "why_it_matters": (
                "Structure can improve follow-through without removing creativity."
            ),
            "priority": "High",
            "time_horizon": "Immediate",
            "goal_alignment": "Personal development",
        },
        {
            "area": "Relationships",
            "title": "Communicate feelings clearly",
            "description": (
                "Emotional awareness becomes more useful when expressed "
                "directly."
            ),
            "action": (
                "Use clear language when discussing needs and expectations."
            ),
            "why_it_matters": (
                "Clear expression can reduce misunderstandings."
            ),
            "priority": "High",
            "time_horizon": "Ongoing",
            "goal_alignment": "Relationship clarity",
        },
        {
            "area": "Finance",
            "title": "Add structure to decisions",
            "description": (
                "Creative thinking should be balanced with basic financial "
                "planning."
            ),
            "action": (
                "Set a spending limit before discretionary decisions."
            ),
            "why_it_matters": (
                "Simple boundaries can make decisions more deliberate."
            ),
            "priority": "Medium",
            "time_horizon": "Ongoing",
            "goal_alignment": "Financial structure",
        },
        {
            "area": "Spiritual Development",
            "title": "Create quiet reflection space",
            "description": (
                "Use intentional reflection to distinguish intuition "
                "from immediate emotional reactions."
            ),
            "action": (
                "Keep a short reflection journal and review recurring themes."
            ),
            "why_it_matters": (
                "Reflection can help organize intuitive observations."
            ),
            "priority": "Medium",
            "time_horizon": "Ongoing",
            "goal_alignment": "Self-awareness",
        },
    ],

    "recommendation_summary": (
        "The strongest recommendation is to preserve creativity while "
        "adding enough structure to support execution and consistency."
    ),

    "goal_alignment": [
        "Creative development",
        "Practical execution",
        "Relationship clarity",
        "Personal exploration",
    ],

    "reflection_questions": [
        "Which idea deserves a real-world experiment?",
        "Where would a simple routine improve consistency?",
        "How can intuition be balanced with evidence?",
    ],

    # ========================================================
    # LIFE TRENDS
    # ========================================================

    "life_trends": {
        "current_phase": "Creative Exploration",

        "career": {
            "direction": "Creative Development",
            "score": 86,
            "path": "Ideas → Experimentation → Skill Expansion",

            "past_score": 70,
            "present_score": 86,
            "change": 16,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 70,
                "present_score": 86,
                "change": 16,
                "change_label": "+16 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 66},
                {"period": "Developing", "score": 73},
                {"period": "Recent", "score": 80},
                {"period": "Current", "score": 86},
            ],
        },

        "relationships": {
            "direction": "Emotional Connection",
            "score": 88,
            "path": "Understanding → Expression → Connection",

            "past_score": 73,
            "present_score": 88,
            "change": 15,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 73,
                "present_score": 88,
                "change": 15,
                "change_label": "+15 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 69},
                {"period": "Developing", "score": 75},
                {"period": "Recent", "score": 82},
                {"period": "Current", "score": 88},
            ],
        },

        "personal_growth": {
            "direction": "Self-Awareness",
            "score": 90,
            "path": "Reflection → Experimentation → Confidence",

            "past_score": 76,
            "present_score": 90,
            "change": 14,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 76,
                "present_score": 90,
                "change": 14,
                "change_label": "+14 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 72},
                {"period": "Developing", "score": 78},
                {"period": "Recent", "score": 85},
                {"period": "Current", "score": 90},
            ],
        },

        "opportunities": {
            "direction": "Exploration",
            "score": 84,
            "path": "Curiosity → Experimentation → Discovery",

            "past_score": 68,
            "present_score": 84,
            "change": 16,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 68,
                "present_score": 84,
                "change": 16,
                "change_label": "+16 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 63},
                {"period": "Developing", "score": 71},
                {"period": "Recent", "score": 78},
                {"period": "Current", "score": 84},
            ],
        },

        "summary": (
            "The current pattern emphasizes exploration and creativity. "
            "Progress is strongest when new ideas receive enough structure "
            "and follow-through."
        ),
    },

    "life_trend_analysis": {
        "challenge_signals": [
            {
                "title": "Inconsistent follow-through",
                "level": "Moderate",
                "description": (
                    "Many ideas may compete for attention before earlier "
                    "ones are completed."
                ),
            },
            {
                "title": "Overstimulation",
                "level": "Moderate",
                "description": (
                    "Constant stimulation may make reflection and recovery "
                    "more difficult."
                ),
            },
        ],

        "growth_potential": {
            "score": 87,
            "label": "Creative Expansion",
            "description": (
                "The trend pattern supports exploration when creativity "
                "is paired with practical execution."
            ),
        },

        "life_path": {
            "direction": "Explore → Experiment → Create",
            "description": (
                "Trying new approaches can reveal useful directions "
                "when experimentation is followed by reflection."
            ),
        },

        "monitoring_summary": (
            "Monitor follow-through, emotional balance, experimentation "
            "and the transition from ideas to completed outcomes."
        ),
    },
}


# ============================================================
# PROFILE 4
# ============================================================

PRACTICAL_STRUCTURE = {
    "id": "practical_structure",
    "name": "Practical & Structured",

    # ========================================================
    # AI INTERPRETATION
    # ========================================================

    "overview": (
        "Your reading emphasizes organization, dependable decisions, "
        "consistency, and practical planning. Progress is associated with "
        "building strong foundations and improving systems gradually."
    ),

    "personality": (
        "You show a practical and organized style with a preference for "
        "dependable decisions. Clear structures can help reduce uncertainty."
    ),

    "relationships": (
        "Trust, consistency, and clear expectations are emphasized. "
        "Reliable communication can strengthen connections."
    ),

    "career": (
        "Discipline, responsibility, and steady development are highlighted. "
        "Building expertise through repeatable processes can support progress."
    ),

    "finance": (
        "Planning and controlled spending are emphasized. Clear categories "
        "and priorities can make financial decisions easier to manage."
    ),

    "health_wellness": (
        "Consistent routines and recovery are emphasized. Sustainable habits "
        "are more useful than irregular bursts of effort."
    ),

    "personal_growth": (
        "Small measurable improvements are favored over sudden changes. "
        "Tracking progress can make development easier to sustain."
    ),

    "life_opportunities": (
        "Preparation and consistency can make opportunities easier to "
        "recognize and use. Strong foundations can support future changes."
    ),

    "key_themes": [
        "Organization",
        "Consistency",
        "Planning",
        "Dependability",
        "Foundation building",
    ],

    "dominant_patterns": [
        {
            "title": "Systematic thinking",
            "description": (
                "Clear processes and organized information may make "
                "complex situations easier to manage."
            ),
        },
        {
            "title": "Preference for reliability",
            "description": (
                "Predictable routines and dependable outcomes may be "
                "particularly valuable."
            ),
        },
        {
            "title": "Incremental improvement",
            "description": (
                "Small measurable changes may be more sustainable than "
                "large sudden transformations."
            ),
        },
    ],

    "areas_to_reflect": [
        "Where could more flexibility improve your current approach?",
        "Which process could be simplified?",
        "Where could experimentation provide useful information?",
    ],

    "synthesis": (
        "The strongest cross-domain pattern is structured progress. "
        "Organization and consistency provide a strong foundation, while "
        "flexibility can create room for new opportunities."
    ),

    # ========================================================
    # PERSONALITY INTELLIGENCE
    # ========================================================

    "personality_profile": {
        "type": "Practical Strategist",

        "dimensions": {
            "Emotional Awareness": 74,
            "Practical Thinking": 94,
            "Intuition": 66,
            "Adaptability": 74,
            "Communication": 82,
            "Consistency": 95,
            "Self-Reflection": 79,
        },

        "strengths": [
            "Organization",
            "Consistency",
            "Planning",
            "Dependability",
        ],

        "development_areas": [
            "Allow flexibility",
            "Avoid excessive control",
            "Make room for experimentation",
            "Balance structure with intuition",
        ],

        "summary": (
            "A structured and dependable profile that values practical "
            "progress. Flexibility and experimentation can complement the "
            "strong preference for organization."
        ),

        "behavioral_insights": {
            "decision_making": (
                "You may prefer decisions supported by clear information, "
                "planning and predictable outcomes."
            ),
            "interaction_style": (
                "You may value reliability, explicit expectations and "
                "consistent communication."
            ),
            "work_style": (
                "You may perform well with repeatable systems, clear "
                "responsibilities and measurable processes."
            ),
            "growth_style": (
                "Tracking small improvements can provide a strong sense "
                "of progress and support long-term consistency."
            ),
        },

        "dominant_traits": [
            "Consistency",
            "Practical thinking",
            "Organization",
        ],

        "development_focus": {
            "focus": "Structure with flexibility",
            "current_tendency": (
                "Strong organization and planning may encourage "
                "preference for predictable approaches."
            ),
            "growth_direction": (
                "Allow controlled experimentation and alternative "
                "approaches where useful."
            ),
            "reflection_question": (
                "Where could trying a different approach provide useful information?"
            ),
        },
    },

    # ========================================================
    # RECOMMENDATIONS
    # ========================================================

    "recommendations": [
        {
            "area": "Career",
            "title": "Build repeatable systems",
            "description": (
                "Create a simple process for recurring responsibilities."
            ),
            "action": (
                "Document one workflow and improve it each week."
            ),
            "why_it_matters": (
                "Repeatable systems can improve reliability and efficiency."
            ),
            "priority": "High",
            "time_horizon": "Near term",
            "goal_alignment": "Career efficiency",
        },
        {
            "area": "Personal Growth",
            "title": "Track small improvements",
            "description": (
                "Visible progress can reinforce consistent habits."
            ),
            "action": (
                "Track one measurable habit for 30 days."
            ),
            "why_it_matters": (
                "Tracking can make gradual progress easier to maintain."
            ),
            "priority": "High",
            "time_horizon": "30 days",
            "goal_alignment": "Habit development",
        },
        {
            "area": "Relationships",
            "title": "State expectations clearly",
            "description": (
                "Consistency improves when expectations are explicit."
            ),
            "action": (
                "Discuss roles and boundaries before misunderstandings "
                "develop."
            ),
            "why_it_matters": (
                "Clear expectations can strengthen trust and reliability."
            ),
            "priority": "High",
            "time_horizon": "Ongoing",
            "goal_alignment": "Relationship stability",
        },
        {
            "area": "Wellness",
            "title": "Keep routines sustainable",
            "description": (
                "Simple routines are easier to maintain than extreme "
                "schedules."
            ),
            "action": (
                "Choose a realistic daily routine and maintain it "
                "consistently."
            ),
            "why_it_matters": (
                "Sustainable routines are easier to maintain over time."
            ),
            "priority": "Medium",
            "time_horizon": "Ongoing",
            "goal_alignment": "Wellness",
        },
        {
            "area": "Spiritual Development",
            "title": "Create structured reflection",
            "description": (
                "Use a consistent reflection process to review priorities "
                "and personal direction."
            ),
            "action": (
                "Use a weekly journal prompt to review progress and priorities."
            ),
            "why_it_matters": (
                "Structured reflection can complement practical planning."
            ),
            "priority": "Medium",
            "time_horizon": "Weekly",
            "goal_alignment": "Self-development",
        },
    ],

    "recommendation_summary": (
        "The recommendation pattern emphasizes dependable systems, "
        "measurable habits and gradual improvement while leaving room "
        "for controlled experimentation."
    ),

    "goal_alignment": [
        "Improve efficiency",
        "Build sustainable habits",
        "Strengthen relationships",
        "Maintain structured progress",
    ],

    "reflection_questions": [
        "Which process could be improved this week?",
        "Where could flexibility produce a better result?",
        "Which habit would benefit most from tracking?",
    ],

    # ========================================================
    # LIFE TRENDS
    # ========================================================

    "life_trends": {
        "current_phase": "Foundation Building",

        "career": {
            "direction": "Steady Development",
            "score": 88,
            "path": "Structure → Expertise → Reliability",

            "past_score": 72,
            "present_score": 88,
            "change": 16,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 72,
                "present_score": 88,
                "change": 16,
                "change_label": "+16 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 68},
                {"period": "Developing", "score": 75},
                {"period": "Recent", "score": 82},
                {"period": "Current", "score": 88},
            ],
        },

        "relationships": {
            "direction": "Trust & Stability",
            "score": 84,
            "path": "Consistency → Trust → Stability",

            "past_score": 70,
            "present_score": 84,
            "change": 14,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 70,
                "present_score": 84,
                "change": 14,
                "change_label": "+14 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 66},
                {"period": "Developing", "score": 72},
                {"period": "Recent", "score": 79},
                {"period": "Current", "score": 84},
            ],
        },

        "personal_growth": {
            "direction": "Measured Improvement",
            "score": 86,
            "path": "Routine → Tracking → Progress",

            "past_score": 71,
            "present_score": 86,
            "change": 15,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 71,
                "present_score": 86,
                "change": 15,
                "change_label": "+15 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 67},
                {"period": "Developing", "score": 73},
                {"period": "Recent", "score": 80},
                {"period": "Current", "score": 86},
            ],
        },

        "opportunities": {
            "direction": "Prepared Expansion",
            "score": 81,
            "path": "Foundation → Readiness → Opportunity",

            "past_score": 65,
            "present_score": 81,
            "change": 16,

            "comparison": {
                "past_label": "Previous Profile",
                "present_label": "Current Profile",
                "past_score": 65,
                "present_score": 81,
                "change": 16,
                "change_label": "+16 points",
            },

            "chart_data": [
                {"period": "Earlier", "score": 61},
                {"period": "Developing", "score": 68},
                {"period": "Recent", "score": 75},
                {"period": "Current", "score": 81},
            ],
        },

        "summary": (
            "The current pattern emphasizes strong foundations and dependable "
            "progress. Gradual improvements can create room for larger "
            "opportunities later."
        ),
    },

    "life_trend_analysis": {
        "challenge_signals": [
            {
                "title": "Excessive control",
                "level": "Moderate",
                "description": (
                    "A strong preference for structure may occasionally "
                    "make unexpected changes harder to accommodate."
                ),
            },
            {
                "title": "Limited experimentation",
                "level": "Low",
                "description": (
                    "Highly familiar processes may reduce opportunities "
                    "to discover alternative approaches."
                ),
            },
        ],

        "growth_potential": {
            "score": 86,
            "label": "Structured Growth",
            "description": (
                "Strong consistency and practical thinking provide a "
                "stable foundation for gradual development."
            ),
        },

        "life_path": {
            "direction": "Foundation → Optimization → Expansion",
            "description": (
                "Strengthening existing systems can create a reliable "
                "base for future expansion."
            ),
        },

        "monitoring_summary": (
            "Monitor consistency, flexibility, process improvement and "
            "whether structure continues to support rather than restrict growth."
        ),
    },
}


# ============================================================
# MAIN DEMO PROFILE COLLECTION
# ============================================================

AI_INTERPRETATION_DEMOS = [
    REFLECTIVE_BALANCE,
    AMBITIOUS_GROWTH,
    INTUITIVE_CREATIVE,
    PRACTICAL_STRUCTURE,
]