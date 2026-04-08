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
    "manor-inheritance": {
        text: "You unexpectedly inherit a sprawling, slightly dilapidated Victorian manor filled to the brim with dust, antique clutter, and rumors of secret passages behind the bookcases. You step into the chaotic foyer for the first time; what is your immediate plan of action?",
        tags: [
            "conscientiousness",
            "openness"
        ],
        choices: {
            "conscientious-open": {
                text: "I draft a meticulous renovation plan to restore the architecture while preserving the eccentricities, aiming to convert the manor into a curated museum of curiosities.",
                impulses: {
                    conscientiousness: 0.8,
                    openness: 0.8
                }
            },
            "conscientious-closed": {
                text: "I immediately hire a professional cleaning crew and an appraiser to catalogue every single item, focusing on a strictly efficient estate sale.",
                impulses: {
                    conscientiousness: 0.8,
                    openness: -0.8
                }
            },
            "spontaneous-open": {
                text: "I grab a flashlight and ignore the mess entirely, spending the first night hunting for secret passages and imagining an impromptu artist retreat.",
                impulses: {
                    conscientiousness: -0.8,
                    openness: 0.8
                }
            },
            "spontaneous-closed": {
                text: "I invite my friends over for a party amidst the chaos; we can worry about the cleaning and the serious decisions much later.",
                impulses: {
                    conscientiousness: -0.8,
                    openness: -0.8
                }
            }
        }
    },
    "the-ticking-archive": {
        "text": "In the damp cellar of a defunct clockmaker, you find a lead-lined chest vibrating with a rhythmic pulse and labeled: 'Do Not Open Until the World Ends.'",
        "tags": [
            "openness",
            "conscientiousness"
        ],
        "choices": {
            "openness-hi-conscientiousness-hi": {
                "text": "I will record the pulse intervals and cross-reference them with local seismic data before attempting a controlled, documented opening.",
                "impulses": {
                    "openness": 0.8,
                    "conscientiousness": 0.8
                }
            },
            "openness-hi-conscientiousness-lo": {
                "text": "The world is always ending for someone, isn't it? Let's just smash the lock and see if we find a mechanical heart or a shortcut to another dimension.",
                "impulses": {
                    "openness": 0.8,
                    "conscientiousness": -0.8
                }
            },
            "openness-lo-conscientiousness-hi": {
                "text": "The warning is clear and the structural integrity of the seal must be maintained. I'll file a report and ensure the chest is secured according to safety protocols.",
                "impulses": {
                    "openness": -0.8,
                    "conscientiousness": 0.8
                }
            },
            "openness-lo-conscientiousness-lo": {
                "text": "It's probably just an old prank or a broken pendulum catching on the casing. I'll leave it where it is and get back to the actual work I came here for.",
                "impulses": {
                    "openness": -0.8,
                    "conscientiousness": -0.8
                }
            }
        }
    },
    "blueprint-ghost-key": {
        "text": "A dinner guest slides a heavy, rusted skeleton key across the table, claiming it unlocks a hidden chamber not found on the estate's blueprints. The room goes quiet, all eyes turning to you to decide whether to hunt for the mystery or stick to the wine.",
        "tags": [
            "extraversion",
            "openness"
        ],
        "choices": {
            "extraversion-hi-openness-hi": {
                "text": "Jackpot. Everyone, grab your drinks—we aren't leaving until we find the door that shouldn't exist. Let's see what’s actually behind the woodwork!",
                "impulses": {
                    "extraversion": 0.8,
                    "openness": 0.8
                }
            },
            "extraversion-hi-openness-lo": {
                "text": "Blueprints get misread all the time, but I'm always up for a house tour. Follow me, everyone—I bet it's just a forgotten wine cellar or a storage nook.",
                "impulses": {
                    "extraversion": 0.8,
                    "openness": -0.8
                }
            },
            "extraversion-lo-openness-hi": {
                "text": "I'll take it. There's a specific kind of beauty in a space that was meant to be forgotten; I’d prefer to wander the halls and see where the layout feels... off.",
                "impulses": {
                    "extraversion": -0.8,
                    "openness": 0.8
                }
            },
            "extraversion-lo-openness-lo": {
                "text": "It's probably just a spare for the back gate. I’ll leave it here by the centerpiece so the host can put it back where it belongs tomorrow.",
                "impulses": {
                    "extraversion": -0.8,
                    "openness": -0.8
                }
            }
        }
    },
    "shattered-centerpiece-crisis": {
        "text": "The centerpiece of the gallery—a precarious tower of salvaged glass—shatters after a guest stumbles into it, leaving the artist trembling while the crowd freezes in awkward silence.",
        "tags": [
            "extraversion",
            "agreeableness"
        ],
        "choices": {
            "extraversion-hi-agreeableness-hi": {
                "text": "Everyone, don't just stand there! Let's all pitch in and help the artist turn this accident into a new collective masterpiece right now!",
                "impulses": {
                    "extraversion": 0.8,
                    "agreeableness": 0.8
                }
            },
            "extraversion-hi-agreeableness-lo": {
                "text": "Look, it is broken. Let’s stop pretending it is a tragedy and just admit the layout was a total safety hazard from the start.",
                "impulses": {
                    "extraversion": 0.8,
                    "agreeableness": -0.8
                }
            },
            "extraversion-lo-agreeableness-hi": {
                "text": "I will go find the staff and get some cleaning supplies so we can quietly clear this up before anyone gets hurt.",
                "impulses": {
                    "extraversion": -0.8,
                    "agreeableness": 0.8
                }
            },
            "extraversion-lo-agreeableness-lo": {
                "text": "I am staying out of the way. There is no point in getting involved in a scene that does not concern me.",
                "impulses": {
                    "extraversion": -0.8,
                    "agreeableness": -0.8
                }
            }
        }
    },
    "ink-stain-rivalry": {
        "text": "Your professional rival is seconds away from being called to the podium for a major award when you spot a massive, spreading ink stain on the back of their white blazer.",
        "tags": [
            "neuroticism",
            "agreeableness"
        ],
        "choices": {
            "neuroticism-hi-agreeableness-hi": {
                "text": "Oh no, this is a disaster! Quick, take my scarf and drape it over your shoulder—we have to hide this before you get to the stage.",
                "impulses": {
                    "neuroticism": 0.8,
                    "agreeableness": 0.8
                }
            },
            "neuroticism-hi-agreeableness-lo": {
                "text": "You've got a huge mess on your back. It’s a total wreck—you’re really going to walk up there and let everyone see that?",
                "impulses": {
                    "neuroticism": 0.8,
                    "agreeableness": -0.8
                }
            },
            "neuroticism-lo-agreeableness-hi": {
                "text": "Stay still for a second. There is a mark on your blazer, but if you keep your posture rigid and walk slightly to the left, no one will see it.",
                "impulses": {
                    "neuroticism": -0.8,
                    "agreeableness": 0.8
                }
            },
            "neuroticism-lo-agreeableness-lo": {
                "text": "There is a giant ink leak on your jacket. It’s going to be a very memorable photo op for you.",
                "impulses": {
                    "neuroticism": -0.8,
                    "agreeableness": -0.8
                }
            }
        }
    },
    "uninvited-performance-artist": {
        "text": "Your collaborator brings a silent performance artist into the studio who begins rearranging your calibrated equipment as part of an 'exploratory piece.' The project is due in three hours.",
        "tags": [
            "agreeableness",
            "neuroticism"
        ],
        "choices": {
            "agreeableness-hi-neuroticism-hi": {
                "text": "I really want to support the vision, but I’m honestly panicking about the deadline—could we please find a way to do this without touching the main rig?",
                "impulses": {
                    "agreeableness": 0.8,
                    "neuroticism": 0.8
                }
            },
            "agreeableness-hi-neuroticism-lo": {
                "text": "It’s a unique perspective to add to the space. We’ll just need a few minutes to reset everything once they’ve finished their exploration.",
                "impulses": {
                    "agreeableness": 0.8,
                    "neuroticism": -0.8
                }
            },
            "agreeableness-lo-neuroticism-hi": {
                "text": "This is a total train wreck. If they mess up the calibration, we are finished, and I’m not spending all night fixing your friend’s mess.",
                "impulses": {
                    "agreeableness": -0.8,
                    "neuroticism": 0.8
                }
            },
            "agreeableness-lo-neuroticism-lo": {
                "text": "The equipment stays where it is. If they can't perform without moving the gear, they need to find a different room.",
                "impulses": {
                    "agreeableness": -0.8,
                    "neuroticism": -0.8
                }
            }
        }
    }
};
