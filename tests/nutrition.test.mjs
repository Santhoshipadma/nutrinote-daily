import assert from "node:assert/strict";
import test from "node:test";

import { analyseDay, buildCalendarFile } from "../lib/nutrition.mjs";

test("recognizes a balanced vegetarian day", () => {
  const result = analyseDay({
    meals: {
      breakfast: "oats with yogurt, chia and banana",
      lunch: "brown rice, dal, spinach and carrots",
      dinner: "tofu with broccoli and sesame",
      snacks: "apple and almonds",
    },
    waterCups: 7,
    diet: "vegetarian",
  });

  assert.equal(result.coveredCount, result.totalCount);
  assert.equal(result.score, 100);
  assert.equal(result.headline, "You built a well-rounded day.");
});

test("suggests missing building blocks without diagnosing a deficiency", () => {
  const result = analyseDay({
    meals: { breakfast: "toast and coffee", lunch: "rice", dinner: "pasta", snacks: "" },
    waterCups: 3,
    diet: "vegetarian",
  });

  assert.equal(result.priorities.length, 3);
  assert.ok(result.priorities.some((item) => item.id === "protein"));
  assert.doesNotMatch(JSON.stringify(result), /deficien|diagnos|prescri/i);
});

test("creates three repeating calendar reminders", () => {
  const calendar = buildCalendarFile({ morning: "08:00", afternoon: "13:00", evening: "19:30" });
  assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 3);
  assert.equal((calendar.match(/RRULE:FREQ=DAILY/g) ?? []).length, 3);
  assert.match(calendar, /five-minute food reflection/i);
});
