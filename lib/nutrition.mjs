const foodGroups = [
  {
    id: "protein",
    label: "Protein foods",
    keywords: [
      "dal", "lentil", "moong", "chana", "chickpea", "rajma", "bean",
      "tofu", "tempeh", "paneer", "yogurt", "curd", "egg", "chicken",
      "fish", "turkey", "meat", "edamame", "quinoa",
    ],
    vegetarianSuggestion:
      "Try dal, chickpeas, tofu, paneer, Greek yogurt, edamame or moong dosa.",
    mixedSuggestion:
      "Try dal, beans, eggs, yogurt, chicken or fish with one main meal.",
  },
  {
    id: "vegetables",
    label: "Colorful vegetables",
    keywords: [
      "vegetable", "spinach", "carrot", "broccoli", "pepper", "tomato",
      "cucumber", "cabbage", "okra", "beans", "beet", "greens",
      "lettuce", "cauliflower", "zucchini",
    ],
    vegetarianSuggestion:
      "Add two colors—for example spinach and carrots—to lunch or dinner.",
    mixedSuggestion:
      "Add two colors—for example broccoli and peppers—to lunch or dinner.",
  },
  {
    id: "fruit",
    label: "Fruit",
    keywords: [
      "fruit", "apple", "banana", "orange", "berries", "berry", "mango",
      "grapes", "melon", "guava", "pear", "kiwi",
    ],
    vegetarianSuggestion:
      "Keep one easy fruit visible and have it with breakfast or as a snack.",
    mixedSuggestion:
      "Keep one easy fruit visible and have it with breakfast or as a snack.",
  },
  {
    id: "whole-grains",
    label: "Whole grains",
    keywords: [
      "oats", "oatmeal", "brown rice", "whole wheat", "whole-grain",
      "whole grain", "roti", "quinoa", "millet", "ragi", "barley",
    ],
    vegetarianSuggestion:
      "Choose oats, whole-wheat roti, brown rice, quinoa, millet or ragi.",
    mixedSuggestion:
      "Choose oats, whole-wheat bread, brown rice, quinoa or barley.",
  },
  {
    id: "calcium",
    label: "Calcium-rich foods",
    keywords: [
      "milk", "yogurt", "curd", "paneer", "cheese", "tofu", "ragi",
      "sesame", "fortified",
    ],
    vegetarianSuggestion:
      "Plan yogurt, milk, calcium-set tofu, ragi, sesame or a fortified alternative.",
    mixedSuggestion:
      "Plan yogurt, milk, cheese, calcium-set tofu or a fortified alternative.",
  },
  {
    id: "healthy-fats",
    label: "Healthy fats",
    keywords: [
      "almond", "walnut", "nuts", "seeds", "chia", "flax", "pumpkin seed",
      "sunflower seed", "avocado", "peanut butter", "olive oil",
    ],
    vegetarianSuggestion:
      "Add a small portion of nuts, seeds, avocado or peanut butter.",
    mixedSuggestion:
      "Add a small portion of nuts, seeds, avocado, olive oil or oily fish.",
  },
];

/** Turns everyday food notes into a broad, non-medical food-group reflection. */
export function analyseDay({ meals, waterCups, diet }) {
  const mealTexts = Object.values(meals).map((meal) => meal.trim());
  const allFood = mealTexts.join(" ").toLowerCase();
  const groups = foodGroups.map((group) => ({
    id: group.id,
    label: group.label,
    covered: group.keywords.some((keyword) => allFood.includes(keyword)),
    suggestion:
      diet === "vegetarian"
        ? group.vegetarianSuggestion
        : group.mixedSuggestion,
  }));

  const enteredMeals = mealTexts.filter(Boolean).length;
  const coveredCount = groups.filter((group) => group.covered).length;
  const waterCovered = waterCups >= 6;
  const totalCount = foodGroups.length + 1;
  const score = Math.round(((coveredCount + Number(waterCovered)) / totalCount) * 100);
  const missing = groups.filter((group) => !group.covered);
  const priorities = missing.length
    ? missing.slice(0, 3)
    : [{
        id: "repeat-balance",
        label: "the same balance",
        covered: false,
        suggestion:
          "You mentioned every major food group. Repeat what felt realistic, not what felt perfect.",
      }];

  if (!waterCovered && priorities.length < 3) {
    priorities.push({
      id: "hydration",
      label: "a hydration pause",
      covered: false,
      suggestion:
        "Keep water nearby and use your morning or afternoon reminder as a drinking cue.",
    });
  }

  let headline = "A useful start—tomorrow can be simpler.";
  if (score >= 80) headline = "You built a well-rounded day.";
  else if (score >= 55) headline = "You covered several strong basics.";
  else if (enteredMeals >= 2) headline = "You showed up—and that matters.";

  return {
    score,
    coveredCount: coveredCount + Number(waterCovered),
    totalCount,
    enteredMeals,
    headline,
    groups,
    priorities: priorities.slice(0, 3),
  };
}

function nextDateStamp(time) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, minute, 0, 0);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(hour)}${pad(minute)}00`;
}

/** Builds a standard calendar file with three daily reminders. */
export function buildCalendarFile(times) {
  const reminders = [
    ["morning", "NutriNote: plan one good choice"],
    ["afternoon", "NutriNote: add color and water"],
    ["evening", "NutriNote: five-minute food reflection"],
  ];

  const events = reminders.map(([key, title]) => `BEGIN:VEVENT
UID:nutrinote-${key}@daily
DTSTAMP:${nextDateStamp("00:00")}
DTSTART:${nextDateStamp(times[key])}
RRULE:FREQ=DAILY
SUMMARY:${title}
DESCRIPTION:A gentle daily cue from NutriNote Daily.
BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
DESCRIPTION:${title}
END:VALARM
END:VEVENT`).join("\n");

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NutriNote Daily//EN
CALSCALE:GREGORIAN
${events}
END:VCALENDAR`;
}
