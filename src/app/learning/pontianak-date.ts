/** Asia/Pontianak 当地日期（YYYY-MM-DD）。纯函数独立成模块：
 *  客户端组件可以静态导入它做"定时未到点"判断，而不把 supabase-js 拖进初始模块图。 */
export function pontianakToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Pontianak", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}
