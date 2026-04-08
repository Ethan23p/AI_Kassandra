/**
 * KASSANDRA CONTENT ENGINE: QUESTIONS
 *
 * This map represents the 'Scenes' or narrative nodes of the assessment.
 *
 * --- STRUCTURE ---
 * [QUESTION_SLUG]: {
 *   text: "The narrative prompt presented to the user.",
 *   tags: ["trait_1", "trait_2"], // Broad trait categories involved.
 *   choices: {
 *     [CHOICE_SLUG]: {
 *       text: "The selection text shown on the button.",
 *       impulses: {
 *         "trait_name": 0.5, // Range: -1.0 to 1.0.
 *                            // Values push the user's current score toward the boundary via the 'Remaining Room' algorithm.
 *       }
 *     }
 *   }
 * }
 *
 * --- CONSTRAINTS ---
 * - Question slugs and Choice slugs must be URL-safe (kebab-case recommended).
 * - Impulses should stay between -1.0 (Low) and 1.0 (High).
 *
 * --- TRAIT KEY (Big 5) ---
 * 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'
 */

import { QuestionMap } from '../types';

export const questionsData: QuestionMap = {
    "the-itinerary-unravels": {
        "text": "The long-awaited road trip hits a snag when your destination is unexpectedly closed for the day. Your friends are starting to argue, and the carefully crafted schedule is dissolving in the heat of the roadside.",
        "tags": ["agreeableness","conscientiousness"],
        "choices": {
            "structured-harmonizer": {
                "text": "I’ll step in to soothe the tension and lead everyone through a systematic review of our backup options to get us back on a clear schedule.",
                "impulses": {
                    "agreeableness": 0.8,
                    "conscientiousness": 0.8
                }
            },
            "spontaneous-harmonizer": {
                "text": "I’ll suggest we ditch the itinerary entirely and just wander together, following whatever local recommendation or interesting side-road we stumble upon.",
                "impulses": {
                    "agreeableness": 0.8,
                    "conscientiousness": -0.8
                }
            },
            "structured-autonomous": {
                "text": "I’ll tune out the bickering and start mapping out the most efficient detour myself, then tell the group exactly where we’re going next.",
                "impulses": {
                    "agreeableness": -0.8,
                    "conscientiousness": 0.8
                }
            },
            "spontaneous-autonomous": {
                "text": "I’m going to head off on my own for a few hours; I’d rather explore whatever looks fun in the moment than wait for a committee to decide.",
                "impulses": {
                    "agreeableness": -0.8,
                    "conscientiousness": -0.8
                }
            }
        }
    },
    "the-velvet-curtain": {
        "text": "A heavy velvet curtain has appeared overnight in the back of your local bookstore, leading to an unannounced 'sensory exhibit.' The air smells of ozone, and a low, vibrating hum pulses from the darkness behind the fabric.",
        "tags": ["openness","neuroticism"],
        "choices": {
            "vivid-immersion": {
                "text": "I’ll go in because I need to see the art, even though the strange atmosphere makes my heart race and my skin prickle.",
                "impulses": {
                    "openness": 0.8,
                    "neuroticism": 0.8
                }
            },
            "fearless-exploration": {
                "text": "This looks like a fascinating creative experiment. I’ll push through the curtain to explore whatever bizarre world they’ve built inside.",
                "impulses": {
                    "openness": 0.8,
                    "neuroticism": -0.8
                }
            },
            "unsettled-avoidance": {
                "text": "I’ll stay in the familiar aisles; the sudden change is too jarring, and the vibrating noise is making me feel increasingly anxious.",
                "impulses": {
                    "openness": -0.8,
                    "neuroticism": 0.8
                }
            },
            "practical-disinterest": {
                "text": "I have no interest in strange distractions when I’m here for a specific book. I’ll finish my shopping and head out as planned.",
                "impulses": {
                    "openness": -0.8,
                    "neuroticism": -0.8
                }
            }
        }
    },
    "neighborhood-festival": {
        "text": "A vibrant, unannounced street festival has taken over the neighborhood square, filling the air with woodsmoke and loud music. You had a strict schedule of household chores and errands planned for the entire afternoon.",
        "tags": ["conscientiousness","extraversion"],
        "choices": {
            "expedite-and-engage": {
                "text": "I’ll power through my chores at double-speed so I can head down and join the crowd for the evening.",
                "impulses": {
                    "conscientiousness": 0.8,
                    "extraversion": 0.8
                }
            },
            "stick-to-schedule": {
                "text": "I’m sticking to my original plan; the festival looks interesting, but my priorities for the day are already set.",
                "impulses": {
                    "conscientiousness": 0.8,
                    "extraversion": -0.8
                }
            },
            "drop-everything-join": {
                "text": "The errands can wait—I’m heading straight into the thick of it to meet people and see what the commotion is about.",
                "impulses": {
                    "conscientiousness": -0.8,
                    "extraversion": 0.8
                }
            },
            "wander-and-observe": {
                "text": "I'll set aside my list and take a slow, solo walk through the outskirts of the festival to soak in the atmosphere.",
                "impulses": {
                    "conscientiousness": -0.8,
                    "extraversion": -0.8
                }
            }
        }
    },
    "dinner-party-blackout": {
        "text": "You are mid-sentence during a lively dinner party when the power cuts out, plunging the room into absolute darkness. The sudden silence is heavy with the smell of extinguished candles and the startled breaths of the guests.",
        "tags": ["extraversion","neuroticism"],
        "choices": {
            "vocal-vigilant": {
                "text": "I’ll start a group song to keep the energy up, even while I’m scanning the dark for any sign of real trouble.",
                "impulses": {
                    "extraversion": 0.8,
                    "neuroticism": 0.8
                }
            },
            "jovial-leader": {
                "text": "I’ll project my voice over the confusion, making a joke of the situation and rallying everyone to help find the matches.",
                "impulses": {
                    "extraversion": 0.8,
                    "neuroticism": -0.8
                }
            },
            "quiet-observer": {
                "text": "I’ll retreat into total silence, staying hyper-alert to every footstep and whisper in the shadows until the lights return.",
                "impulses": {
                    "extraversion": -0.8,
                    "neuroticism": 0.8
                }
            },
            "composed-stayer": {
                "text": "I’ll stay exactly where I am, savoring the sudden stillness and waiting patiently for the host to resolve the issue.",
                "impulses": {
                    "extraversion": -0.8,
                    "neuroticism": -0.8
                }
            }
        }
    },
    "lunar-fog-ascent": {
        "text": "You have spent weeks planning a midnight hike to witness a rare lunar eclipse from the summit. Just as you reach the trailhead, a heavy fog rolls in, swallowing the path and the sky.",
        "tags": ["conscientiousness","neuroticism"],
        "choices": {
            "safety-backup": {
                "text": "I'll strictly follow our secondary safety route while monitoring the radar every few minutes. I need to be sure we are managing every possible risk as we proceed.",
                "impulses": {
                    "conscientiousness": 0.8,
                    "neuroticism": 0.8
                }
            },
            "methodical-ascent": {
                "text": "I’ll proceed with the planned ascent at a steady, methodical pace. We are well-prepared for this contingency, and I see no reason to deviate from the schedule.",
                "impulses": {
                    "conscientiousness": 0.8,
                    "neuroticism": -0.8
                }
            },
            "anxious-pivot": {
                "text": "I’m feeling really unsettled by the conditions, and the lost view is a blow. Let’s just abandon the hike entirely and find a nearby town to explore instead.",
                "impulses": {
                    "conscientiousness": -0.8,
                    "neuroticism": 0.8
                }
            },
            "mystical-wander": {
                "text": "I'll just start walking and see where we end up. The fog adds a great sense of mystery, and I’m happy to let the original plan go and just enjoy the vibe.",
                "impulses": {
                    "conscientiousness": -0.8,
                    "neuroticism": -0.8
                }
            }
        }
    },
    "cabin-twilight-indecision": {
        "text": "You’re at a weekend cabin with a group of friends, and the final evening has just stretched out before you. The fire is warm, the drinks are poured, and the air is thick with the pleasant indecision of how to spend these last few hours together.",
        "tags": ["extraversion","agreeableness"],
        "choices": {
            "group-catalyst": {
                "text": "I’m the first to suggest a big, inclusive group game that gets everyone laughing. I love being the spark that brings the whole room together into one joyful, shared moment.",
                "impulses": {
                    "extraversion": 0.8,
                    "agreeableness": 0.8
                }
            },
            "spirited-challenger": {
                "text": "I’ll propose a competitive tournament or a bold debate topic to keep the energy high. I love a night with some real friction and heat, where people aren't afraid to test their wits against each other.",
                "impulses": {
                    "extraversion": 0.8,
                    "agreeableness": -0.8
                }
            },
            "quiet-anchor": {
                "text": "I’m happy to settle in and just absorb the warmth of the group's presence from the side. I find a quiet joy in being the steady, supportive listener who helps maintain the peaceful vibe without needing to lead the charge.",
                "impulses": {
                    "extraversion": -0.8,
                    "agreeableness": 0.8
                }
            },
            "independent-observer": {
                "text": "I’ll likely wander off to a quiet nook or the porch to reflect on the weekend in my own headspace. I’m very comfortable setting my own pace and stepping away from the group's momentum whenever I feel the pull of solitude.",
                "impulses": {
                    "extraversion": -0.8,
                    "agreeableness": -0.8
                }
            }
        }
    }
};
