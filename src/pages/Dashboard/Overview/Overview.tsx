import {
  Bell,
  ExternalLink,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  MoreHorizontal,
  Zap,
  Sunrise,
  Sunset,
} from "lucide-react";
import { motion } from "framer-motion";
import { GlassContainer } from "@/components/ui/GlassContainer";

interface DashboardProps {
  reminders: any[];
  plans: any[];
  now: number;
  topSites: any[];
  history: chrome.history.HistoryItem[];
  onEditReminder: (r: any) => void;
  onDeleteReminder: (id: string) => void;
  onCreateReminder: () => void;
  onCreatePlan: () => void;
  onEditPlan: (p: any) => void;
  onTogglePlan: (p: any) => void;
  onDeletePlan: (id: string) => void;
  onAddMostVisited: () => void;
  onEditMostVisited: (site: any) => void;
  onDeleteMostVisited: (id: string) => void;
}

export function Overview({
  reminders,
  plans = [],
  now,
  topSites = [],
  history = [],
  onEditReminder,
  onDeleteReminder,
  onCreateReminder,
  onCreatePlan,
  onEditPlan,
  onTogglePlan,
  onDeletePlan,
  onAddMostVisited,
  onEditMostVisited,
  onDeleteMostVisited,
}: DashboardProps) {
  const activeReminders = reminders
    .filter((r) => !r.deadline || new Date(r.deadline).getTime() > now)
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const completedPlans = plans.filter((p) => p.completedAt);
  const upcomingPlans = plans.filter((p) => !p.completedAt);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col gap-8">
        {/* Main Briefing Card */}
        <GlassContainer className="overflow-hidden relative shadow-2xl">
          {/* Subtle Decorative Glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 relative z-10">
            {/* Left: Active Reminders */}
            <div className="p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    Active Reminders
                  </h2>
                  <p className="text-xs text-text-secondary opacity-60 mt-0.5 font-medium">
                    You have {activeReminders.length} pending events
                  </p>
                </div>
                <button
                  onClick={onCreateReminder}
                  className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                {activeReminders.length > 0 ? (
                  activeReminders.map((reminder) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className="group flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-accent/20 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => onEditReminder(reminder)}
                    >
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-inner">
                        <ReminderIcon title={reminder.title} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-primary truncate">
                          {reminder.title}
                        </h3>
                        <p className="text-[11px] font-medium text-text-secondary opacity-60 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {reminder.deadline
                            ? new Date(reminder.deadline).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )
                            : "No time set"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-semibold text-accent">
                            {reminder.deadline
                              ? getRelativeTime(reminder.deadline, now)
                              : "--:--"}
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse mt-1" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteReminder(reminder.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-danger transition-all translate-x-2 group-hover:translate-x-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-30">
                    <Bell size={40} className="mb-3" />
                    <p className="text-sm font-medium">No active reminders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Daily Plan */}
            <div className="p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    Daily Plan
                  </h2>
                  <p className="text-xs text-text-secondary opacity-60 mt-0.5 font-medium">
                    {plans.length} items scheduled
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onCreatePlan}
                    className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300"
                  >
                    <Plus size={20} />
                  </button>
                  <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Upcoming Column */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <Circle size={14} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Upcoming
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {upcomingPlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onToggle={() => onTogglePlan(plan)}
                        onEdit={() => onEditPlan(plan)}
                        onDelete={() => onDeletePlan(plan.id)}
                      />
                    ))}
                    {upcomingPlans.length === 0 && (
                      <div className="h-20 border border-dashed border-white/5 rounded-lg flex items-center justify-center opacity-20">
                        <span className="text-[10px] font-medium">
                          All caught up
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completed Column */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Completed
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {completedPlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onToggle={() => onTogglePlan(plan)}
                        onEdit={() => onEditPlan(plan)}
                        onDelete={() => onDeletePlan(plan.id)}
                      />
                    ))}
                    {completedPlans.length === 0 && (
                      <div className="h-20 border border-dashed border-white/5 rounded-lg flex items-center justify-center opacity-20">
                        <span className="text-[10px] font-medium">
                          No completed tasks
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassContainer>

        {/* Most Visited Sites (Compact) */}
        <GlassContainer className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-text-secondary">
              <ExternalLink size={14} className="text-accent" /> Most Visited
            </h2>
            <button
              onClick={onAddMostVisited}
              className="px-4 py-2 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-all border border-accent/20"
            >
              + Add Site
            </button>
          </div>
          {topSites?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {topSites.slice(0, 10).map((site, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  className="relative group/site"
                >
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-accent/5 transition-all max-w-[200px] shadow-sm"
                    title={site.title}
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${site.url || ""}&sz=32`}
                      alt=""
                      className="w-5 h-5 opacity-80 group-hover/site:opacity-100 transition-opacity"
                    />
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {site.title}
                    </span>
                    {site.customAdded && (
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </a>

                  {site.customAdded && (
                    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/site:opacity-100 transition-all scale-75 group-hover/site:scale-100 z-10 duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMostVisited(site);
                        }}
                        className="p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-accent transition-colors shadow-lg"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMostVisited(site.id);
                        }}
                        className="p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-red-500 transition-colors shadow-lg"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-text-secondary opacity-30">
              <ExternalLink size={32} className="mb-2" />
              <p className="text-xs font-medium">No sites added yet</p>
            </div>
          )}
        </GlassContainer>

        {/* Recently Visited */}
        {history?.length > 0 && (
          <GlassContainer className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-text-secondary">
                <Clock size={14} className="text-accent" /> Recently Visited
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {history.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-accent/20 hover:bg-white/10 transition-all group overflow-hidden"
                  title={item.title || item.url}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${item.url || ""}&sz=32`}
                    alt=""
                    className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  />
                  <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary truncate">
                    {item.title || "Untitled"}
                  </span>
                </a>
              ))}
            </div>
          </GlassContainer>
        )}
      </div>
    </div>
  );
}

const PlanCard = ({
  plan,
  onToggle,
  onEdit,
  onDelete,
}: {
  plan: any;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const isCompleted = !!plan.completedAt;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`group relative p-4 rounded-lg border transition-all cursor-pointer overflow-hidden ${
        isCompleted
          ? "bg-green-500/5 border-green-500/10 hover:border-green-500/30 shadow-inner"
          : "bg-white/5 border-white/5 hover:border-accent/30 hover:bg-white/10"
      }`}
      onClick={onEdit}
    >
      <div className="flex items-start gap-4 h-full">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-white/20 group-hover:border-accent"
          }`}
        >
          {isCompleted && <CheckCircle2 size={12} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-semibold transition-all ${
              isCompleted
                ? "text-text-primary/40 line-through"
                : "text-text-primary"
            }`}
          >
            {plan.title}
          </h4>

          {plan.description && (
            <p
              className={`text-[11px] mt-2 mb-1 line-clamp-2 font-medium ${isCompleted ? "text-text-secondary/30" : "text-text-secondary/70"}`}
            >
              {plan.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <span
              className={`px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.05em] ${
                isCompleted
                  ? "bg-green-500/20 text-green-500"
                  : "bg-accent/20 text-accent"
              }`}
            >
              {isCompleted ? "Completed" : "Active"}
            </span>
            {plan.deadline && (
              <span
                className={`text-[10px] flex items-center gap-1 font-medium ${isCompleted ? "opacity-30" : "opacity-50"}`}
              >
                <Clock size={10} /> {plan.deadline}
              </span>
            )}
            {isCompleted && plan.completedAt && (
              <span className="text-[10px] text-green-500/50 flex items-center gap-1 font-medium italic">
                Done at{" "}
                {new Date(plan.completedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full min-h-[40px]">
          <div className="flex items-center justify-center">
            {/* Status Indicator */}
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? "border-green-500/20"
                  : "border-accent/40 border-t-accent animate-spin-slow"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isCompleted ? "bg-green-500" : "bg-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"}`}
              />
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-all translate-y-2 group-hover:translate-y-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ReminderIcon = ({ title }: { title: string }) => {
  const t = title.toLowerCase();
  if (t.includes("morning") || t.includes("meditation") || t.includes("yoga"))
    return <Sunrise size={22} />;
  if (t.includes("design") || t.includes("creative") || t.includes("edit"))
    return <Zap size={22} />;
  if (t.includes("sync") || t.includes("client") || t.includes("meeting"))
    return <Clock size={22} />;
  if (t.includes("gym") || t.includes("session") || t.includes("workout"))
    return <Zap size={22} />;
  if (t.includes("dinner") || t.includes("evening") || t.includes("night"))
    return <Sunset size={22} />;
  return <Bell size={22} />;
};

const getRelativeTime = (deadline: string, now: number) => {
  const diff = new Date(deadline).getTime() - now;
  if (diff < 0) return "Now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
