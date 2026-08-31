"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  BellRing,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Leaf,
  LockKeyhole,
  RefreshCcw,
  Sparkles,
  SunMedium,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { analyseDay, buildCalendarFile } from "@/lib/nutrition.mjs";

type Meals = {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
};

type FoodGroupResult = {
  id: string;
  label: string;
  covered: boolean;
  suggestion: string;
};

type DayResult = {
  score: number;
  coveredCount: number;
  totalCount: number;
  enteredMeals: number;
  headline: string;
  groups: FoodGroupResult[];
  priorities: FoodGroupResult[];
};

const emptyMeals: Meals = {
  breakfast: "",
  lunch: "",
  dinner: "",
  snacks: "",
};

const supplementOptions = [
  "Vitamin D",
  "Vitamin B12",
  "Iron",
  "Multivitamin",
  "Omega-3",
];

const mealPrompts: Array<{
  key: keyof Meals;
  label: string;
  placeholder: string;
}> = [
  {
    key: "breakfast",
    label: "Breakfast",
    placeholder: "Example: moong dal dosa with yogurt",
  },
  {
    key: "lunch",
    label: "Lunch",
    placeholder: "Example: rice, dal, spinach and cucumber",
  },
  {
    key: "dinner",
    label: "Dinner",
    placeholder: "Example: tofu wrap with vegetables",
  },
  {
    key: "snacks",
    label: "Snacks & drinks",
    placeholder: "Example: apple, almonds and tea",
  },
];

const energyOptions = ["Low", "Okay", "Steady", "Great"];

function localDateKey() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [meals, setMeals] = useState<Meals>(emptyMeals);
  const [waterCups, setWaterCups] = useState(6);
  const [energy, setEnergy] = useState("Steady");
  const [diet, setDiet] = useState<"vegetarian" | "mixed">("vegetarian");
  const [supplements, setSupplements] = useState<string[]>([]);
  const [otherSupplement, setOtherSupplement] = useState("");
  const [result, setResult] = useState<DayResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [reminderTimes, setReminderTimes] = useState({
    morning: "08:00",
    afternoon: "13:00",
    evening: "19:30",
  });

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    const savedCheckIn = window.localStorage.getItem(
      `nutrinote-check-in-${localDateKey()}`,
    );

    if (savedCheckIn) {
      try {
        const data = JSON.parse(savedCheckIn);
        setMeals(data.meals ?? emptyMeals);
        setWaterCups(data.waterCups ?? 6);
        setEnergy(data.energy ?? "Steady");
        setDiet(data.diet ?? "vegetarian");
        setSupplements(data.supplements ?? []);
        setOtherSupplement(data.otherSupplement ?? "");
        setResult(data.result ?? null);
        if (data.result) setStep(3);
      } catch {
        // If an old local entry is incomplete, simply begin a fresh check-in.
      }
    }

    const savedTimes = window.localStorage.getItem("nutrinote-reminder-times");
    if (savedTimes) {
      try {
        setReminderTimes(JSON.parse(savedTimes));
      } catch {
        // Keep the friendly default reminder times.
      }
    }
  }, []);

  const filledMeals = Object.values(meals).filter((meal) => meal.trim()).length;
  const progress = [25, 55, 80, 100][step];

  function toggleSupplement(name: string) {
    setSupplements((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  function finishCheckIn() {
    const dayResult = analyseDay({ meals, waterCups, diet }) as DayResult;
    const record = {
      date: localDateKey(),
      meals,
      waterCups,
      energy,
      diet,
      supplements,
      otherSupplement,
      result: dayResult,
    };

    window.localStorage.setItem(
      `nutrinote-check-in-${localDateKey()}`,
      JSON.stringify(record),
    );
    setResult(dayResult);
    setSaved(true);
    setStep(3);
    window.setTimeout(() => setSaved(false), 2400);
  }

  function downloadReminders() {
    window.localStorage.setItem(
      "nutrinote-reminder-times",
      JSON.stringify(reminderTimes),
    );
    const calendarText = buildCalendarFile(reminderTimes);
    const file = new Blob([calendarText], { type: "text/calendar;charset=utf-8" });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "nutrinote-daily-reminders.ics";
    link.click();
    URL.revokeObjectURL(fileUrl);
  }

  function startFresh() {
    setStep(0);
    setMeals(emptyMeals);
    setWaterCups(6);
    setEnergy("Steady");
    setSupplements([]);
    setOtherSupplement("");
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-[#f7f1e7] text-[#183b2b]">
      <header className="border-b border-[#183b2b]/10 bg-[#fbf7ef]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#183b2b] text-[#fffaf1] shadow-sm">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-serif text-xl font-bold tracking-tight">
                NutriNote Daily
              </p>
              <p className="text-xs text-[#547060]">Reflect. Notice. Improve.</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-[#183b2b]/15 bg-white/60 px-3 py-1 text-[#476453]"
          >
            <LockKeyhole aria-hidden="true" />
            Saved on your device
          </Badge>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[1fr_310px] lg:py-10">
        <section className="min-w-0">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#cf5a49]">
                <SunMedium className="size-4" aria-hidden="true" />
                {today}
              </p>
              <h1 className="max-w-2xl font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Your five-minute food reflection
              </h1>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#5b7164]">
              No calorie guessing—just a clear look at today and a kinder plan
              for tomorrow.
            </p>
          </div>

          <Card className="overflow-hidden border-[#183b2b]/10 bg-[#fffdf8] py-0 shadow-[0_20px_60px_rgba(48,67,54,0.10)]">
            <div className="border-b border-[#183b2b]/10 bg-white/60 px-6 py-5 sm:px-8">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {step === 3 ? "Today’s reflection" : `Step ${step + 1} of 3`}
                </span>
                <span className="text-[#6b7c70]">About {Math.max(1, 5 - step)} min left</span>
              </div>
              <Progress value={progress} className="h-2 bg-[#e7ded0] [&_[data-slot=progress-indicator]]:bg-[#df8c36]" />
            </div>

            {step === 0 && (
              <div>
                <CardHeader className="px-6 pt-7 sm:px-8">
                  <CardTitle className="flex items-center gap-3 font-serif text-2xl">
                    <span className="grid size-10 place-items-center rounded-2xl bg-[#e9f1e6] text-[#315b3f]">
                      <Utensils aria-hidden="true" />
                    </span>
                    What did you eat today?
                  </CardTitle>
                  <CardDescription className="leading-6">
                    Everyday words are perfect. Add the main foods—you do not
                    need exact measurements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 px-6 pb-8 sm:grid-cols-2 sm:px-8">
                  {mealPrompts.map((prompt) => (
                    <label key={prompt.key} className="grid gap-2">
                      <span className="text-sm font-bold text-[#294b39]">
                        {prompt.label}
                      </span>
                      <Textarea
                        value={meals[prompt.key]}
                        onChange={(event) =>
                          setMeals((current) => ({
                            ...current,
                            [prompt.key]: event.target.value,
                          }))
                        }
                        placeholder={prompt.placeholder}
                        className="min-h-28 resize-none rounded-2xl border-[#cfd8cf] bg-white p-4 leading-6 focus-visible:border-[#315b3f] focus-visible:ring-[#315b3f]/15"
                      />
                    </label>
                  ))}
                  <div className="flex items-center justify-between border-t border-[#183b2b]/10 pt-5 sm:col-span-2">
                    <p className="text-sm text-[#6b7c70]">
                      {filledMeals === 0
                        ? "Start with any meal you remember."
                        : `${filledMeals} meal ${filledMeals === 1 ? "entry" : "entries"} added`}
                    </p>
                    <Button
                      onClick={() => setStep(1)}
                      disabled={filledMeals === 0}
                      className="h-11 rounded-xl bg-[#183b2b] px-5 text-white hover:bg-[#244f3a]"
                    >
                      Continue <ArrowRight aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 1 && (
              <div>
                <CardHeader className="px-6 pt-7 sm:px-8">
                  <CardTitle className="flex items-center gap-3 font-serif text-2xl">
                    <span className="grid size-10 place-items-center rounded-2xl bg-[#e5f3f1] text-[#277066]">
                      <Droplets aria-hidden="true" />
                    </span>
                    A quick body check
                  </CardTitle>
                  <CardDescription className="leading-6">
                    This adds helpful context without judging your day.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-6 pb-8 sm:px-8">
                  <div>
                    <div className="mb-3 flex items-end justify-between">
                      <div>
                        <p className="font-bold">How many cups of water?</p>
                        <p className="mt-1 text-sm text-[#6b7c70]">
                          A rough estimate is enough.
                        </p>
                      </div>
                      <span className="font-serif text-3xl font-bold text-[#277066]">
                        {waterCups}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cups) => (
                        <Button
                          key={cups}
                          type="button"
                          variant="outline"
                          onClick={() => setWaterCups(cups)}
                          aria-pressed={waterCups === cups}
                          className={`h-11 rounded-xl border-[#cbd8d4] ${
                            waterCups === cups
                              ? "border-[#277066] bg-[#277066] text-white hover:bg-[#277066] hover:text-white"
                              : "bg-white hover:bg-[#edf6f3]"
                          }`}
                        >
                          {cups === 8 ? "8+" : cups}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 font-bold">How was your energy?</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {energyOptions.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant="outline"
                          onClick={() => setEnergy(option)}
                          aria-pressed={energy === option}
                          className={`h-11 rounded-xl border-[#d6d3c9] ${
                            energy === option
                              ? "border-[#df8c36] bg-[#fff1dc] text-[#7b4616] hover:bg-[#fff1dc]"
                              : "bg-white"
                          }`}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 font-bold">Suggestion style</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["vegetarian", "Vegetarian"],
                        ["mixed", "Mixed diet"],
                      ].map(([value, label]) => (
                        <Button
                          key={value}
                          type="button"
                          variant="outline"
                          onClick={() => setDiet(value as "vegetarian" | "mixed")}
                          aria-pressed={diet === value}
                          className={`h-12 rounded-xl border-[#d6d3c9] ${
                            diet === value
                              ? "border-[#315b3f] bg-[#e9f1e6] text-[#254a32] hover:bg-[#e9f1e6]"
                              : "bg-white"
                          }`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-[#183b2b]/10 pt-5">
                    <Button variant="ghost" onClick={() => setStep(0)}>
                      <ArrowLeft aria-hidden="true" /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(2)}
                      className="h-11 rounded-xl bg-[#183b2b] px-5 text-white hover:bg-[#244f3a]"
                    >
                      Continue <ArrowRight aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 2 && (
              <div>
                <CardHeader className="px-6 pt-7 sm:px-8">
                  <CardTitle className="flex items-center gap-3 font-serif text-2xl">
                    <span className="grid size-10 place-items-center rounded-2xl bg-[#fff0e8] text-[#c45847]">
                      <Sparkles aria-hidden="true" />
                    </span>
                    Did you take any supplements?
                  </CardTitle>
                  <CardDescription className="leading-6">
                    Log only what you actually took. NutriNote never recommends
                    a dose or replaces medical advice.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-8 sm:px-8">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {supplementOptions.map((name) => (
                      <label
                        key={name}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#d8d6cb] bg-white p-4 transition hover:border-[#315b3f]/50"
                      >
                        <Checkbox
                          checked={supplements.includes(name)}
                          onCheckedChange={() => toggleSupplement(name)}
                          className="border-[#315b3f]/40 data-[state=checked]:border-[#315b3f] data-[state=checked]:bg-[#315b3f]"
                        />
                        <span className="font-semibold">{name}</span>
                      </label>
                    ))}
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold">Anything else? (optional)</span>
                    <Input
                      value={otherSupplement}
                      onChange={(event) => setOtherSupplement(event.target.value)}
                      placeholder="Type the name only—no dosage needed"
                      className="h-12 rounded-xl border-[#d6d3c9] bg-white px-4"
                    />
                  </label>
                  <div className="rounded-2xl bg-[#f2ede3] p-4 text-sm leading-6 text-[#65736a]">
                    Supplements are recorded for your memory only. Food-group
                    suggestions are general wellness ideas, not a diagnosis.
                  </div>
                  <div className="flex justify-between border-t border-[#183b2b]/10 pt-5">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ArrowLeft aria-hidden="true" /> Back
                    </Button>
                    <Button
                      onClick={finishCheckIn}
                      className="h-11 rounded-xl bg-[#cf5a49] px-5 text-white hover:bg-[#b94b3b]"
                    >
                      Analyse my day <Sparkles aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

            {step === 3 && result && (
              <div>
                <div className="bg-[#183b2b] px-6 py-7 text-white sm:px-8">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="mb-2 text-sm font-semibold text-[#f1c679]">
                        Today at a glance
                      </p>
                      <h2 className="font-serif text-3xl font-bold">
                        {result.headline}
                      </h2>
                      <p className="mt-2 text-sm text-white/70">
                        {result.enteredMeals} meal entries · {waterCups} cups of
                        water · energy felt {energy.toLowerCase()}
                      </p>
                    </div>
                    <div className="grid size-24 shrink-0 place-items-center rounded-full border-8 border-white/15 bg-white/10 text-center">
                      <div>
                        <span className="block font-serif text-3xl font-bold">
                          {result.coveredCount}
                        </span>
                        <span className="text-xs text-white/70">
                          of {result.totalCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-8 px-6 py-8 sm:px-8">
                  <section>
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold">
                          Food building blocks
                        </h3>
                        <p className="mt-1 text-sm text-[#6b7c70]">
                          Based only on the foods you typed.
                        </p>
                      </div>
                      <Badge className="bg-[#e9f1e6] text-[#315b3f]">
                        {result.score}% reflected
                      </Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {result.groups.map((group) => (
                        <div
                          key={group.id}
                          className={`flex items-center gap-3 rounded-2xl border p-4 ${
                            group.covered
                              ? "border-[#bcd1be] bg-[#eef5eb]"
                              : "border-[#e2d5c7] bg-[#fff9f0]"
                          }`}
                        >
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-full ${
                              group.covered
                                ? "bg-[#315b3f] text-white"
                                : "bg-[#f4dfc0] text-[#8a581e]"
                            }`}
                          >
                            {group.covered ? (
                              <Check className="size-4" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="size-4" aria-hidden="true" />
                            )}
                          </span>
                          <span className="font-semibold">{group.label}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl bg-[#fff0e8] p-5 sm:p-6">
                    <h3 className="font-serif text-2xl font-bold text-[#923c31]">
                      Tomorrow’s simple priorities
                    </h3>
                    <div className="mt-4 grid gap-3">
                      {result.priorities.map((priority, index) => (
                        <div
                          key={priority.id}
                          className="flex gap-3 rounded-2xl bg-white/70 p-4"
                        >
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#cf5a49] text-sm font-bold text-white">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-bold">Add {priority.label.toLowerCase()}</p>
                            <p className="mt-1 text-sm leading-6 text-[#6c5b51]">
                              {priority.suggestion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="border-t border-[#183b2b]/10 pt-7">
                    <div>
                      <h3 className="flex items-center gap-2 font-serif text-2xl font-bold">
                        <BellRing className="size-5 text-[#df8c36]" aria-hidden="true" />
                        Keep a gentle daily rhythm
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#6b7c70]">
                        Choose times, then add three repeating reminders to
                        your phone or computer calendar.
                      </p>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        ["morning", "Morning", "Plan one good choice"],
                        ["afternoon", "Afternoon", "Add color + water"],
                        ["evening", "Evening", "5-minute check-in"],
                      ].map(([key, label, note]) => (
                        <label
                          key={key}
                          className="rounded-2xl border border-[#d6d3c9] bg-white p-4"
                        >
                          <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                            <Clock3 className="size-4 text-[#df8c36]" aria-hidden="true" />
                            {label}
                          </span>
                          <Input
                            type="time"
                            value={reminderTimes[key as keyof typeof reminderTimes]}
                            onChange={(event) =>
                              setReminderTimes((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            className="h-10 rounded-lg border-[#dedbd2] bg-[#fbf8f1]"
                          />
                          <span className="mt-2 block text-xs text-[#738078]">
                            {note}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={downloadReminders}
                        className="h-11 rounded-xl bg-[#df8c36] px-5 text-[#3f2a12] hover:bg-[#d7812c]"
                      >
                        <BellRing aria-hidden="true" /> Add daily reminders
                      </Button>
                      <Button variant="outline" onClick={startFresh} className="h-11 rounded-xl">
                        <RefreshCcw aria-hidden="true" /> Edit today’s check-in
                      </Button>
                    </div>
                    {saved && (
                      <p className="mt-3 text-sm font-semibold text-[#315b3f]" role="status">
                        Today’s reflection is saved on this device.
                      </p>
                    )}
                  </section>
                </CardContent>
              </div>
            )}
          </Card>
        </section>

        <aside className="space-y-4 lg:pt-[132px]">
          <Card className="border-[#183b2b]/10 bg-[#e9f1e6] shadow-none">
            <CardHeader>
              <CardTitle className="font-serif text-xl">A balanced rhythm</CardTitle>
              <CardDescription className="text-[#5b7164]">
                Three small pauses are easier to keep than one perfect diet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                [SunMedium, "Morning", "Plan protein + water"],
                [Apple, "Afternoon", "Notice fruit or vegetables"],
                [Sparkles, "Evening", "Reflect without judgment"],
              ].map(([Icon, label, note]) => {
                const ItemIcon = Icon as typeof SunMedium;
                return (
                  <div key={label as string} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#315b3f]">
                      <ItemIcon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{label as string}</p>
                      <p className="mt-0.5 text-xs leading-5 text-[#65796c]">
                        {note as string}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="rounded-3xl border border-[#183b2b]/10 bg-[#fffdf8] p-5 text-sm leading-6 text-[#65736a]">
            <p className="mb-2 font-bold text-[#294b39]">What NutriNote calculates</p>
            <p>
              It recognizes common food words and checks broad food groups,
              hydration, meals, and your supplement log. It does not estimate
              calories, diagnose deficiencies, or give medical treatment.
            </p>
          </div>
        </aside>
      </div>

      <footer className="mx-auto max-w-6xl px-5 pb-8 text-center text-xs text-[#728078] sm:px-8">
        General wellness reflection only. For nutrition or supplement advice,
        speak with a qualified healthcare professional.
      </footer>
    </main>
  );
}
