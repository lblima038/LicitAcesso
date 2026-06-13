import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, ScreenLayout } from '@/src/presentation/components';
import { useAppContext } from '@/src/context/AppContext';
import { AppAlert, AlertType } from '@/src/domain/entities';

const ALERT_CFG: Record<AlertType, { icon: string; bg: string; fg: string }> = {
  novo_edital:  { icon: 'file-plus',  bg: '#dbeafe', fg: colors.accent },
  prazo_proximo:{ icon: 'clock',      bg: '#fef3c7', fg: '#92400e' },
  resultado:    { icon: 'award',      bg: '#d1fae5', fg: colors.green },
  atualizacao:  { icon: 'refresh-cw', bg: '#f3e8ff', fg: '#7c3aed' },
};

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function fmtAlertDate(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return 'agora';
    if (h < 24) return `${h}h atrás`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d atrás`;
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch { return ''; }
}

function buildCells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { alerts, deadlines, markAlertAsRead, markAllAlertsAsRead } = useAppContext();
  const [section, setSection] = useState<'alerts' | 'calendar'>('alerts');

  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selDay, setSelDay] = useState<number | null>(null);

  const cells = useMemo(() => buildCells(calYear, calMonth), [calYear, calMonth]);

  const deadlineDays = useMemo(() => {
    const s = new Set<number>();
    deadlines.forEach(d => {
      const dt = new Date(d.date + 'T00:00:00');
      if (dt.getFullYear() === calYear && dt.getMonth() === calMonth) s.add(dt.getDate());
    });
    return s;
  }, [deadlines, calYear, calMonth]);

  const selDeadlines = useMemo(() => {
    if (!selDay) return [];
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
    return deadlines.filter(d => d.date === key);
  }, [deadlines, selDay, calYear, calMonth]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1);
    setSelDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1);
    setSelDay(null);
  };

  const unread = alerts.filter(a => !a.isRead).length;
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

  const SEGMENTS = [
    { key: 'alerts',   label: unread > 0 ? `Avisos (${unread})` : 'Avisos' },
    { key: 'calendar', label: 'Calendário' },
  ] as const;

  const AlertRow = ({ item }: { item: AppAlert }) => {
    const cfg = ALERT_CFG[item.type];
    return (
      <TouchableOpacity
        style={[styles.alertCard, item.isRead && styles.alertCardRead]}
        onPress={() => markAlertAsRead(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.alertIcon, { backgroundColor: cfg.bg }]}>
          <Feather name={cfg.icon as any} size={18} color={cfg.fg} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={styles.alertRow}>
            <Text style={[styles.alertTitle, item.isRead && styles.alertTitleRead]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.alertTime}>{fmtAlertDate(item.dateTime)}</Text>
          </View>
          <Text style={styles.alertDesc} numberOfLines={2}>{item.description}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Segment toggle — 3 abas */}
        <View style={styles.segmented}>
          {SEGMENTS.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.segBtn, section === s.key && styles.segBtnActive]}
              onPress={() => setSection(s.key)}
            >
              <Text style={[styles.segText, section === s.key && styles.segTextActive]} numberOfLines={1}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Avisos ── */}
        {section === 'alerts' && (
          <View style={{ gap: 12 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Notificações</Text>
              {unread > 0 && (
                <TouchableOpacity onPress={markAllAlertsAsRead}>
                  <Text style={styles.markAll}>Marcar todos como lido</Text>
                </TouchableOpacity>
              )}
            </View>
            {alerts.map(item => <AlertRow key={item.id} item={item} />)}
            {alerts.length === 0 && (
              <View style={styles.empty}>
                <Feather name="bell-off" size={40} color={colors.border} />
                <Text style={styles.emptyTitle}>Sem alertas</Text>
                <Text style={styles.emptySubtitle}>Notificações sobre editais e prazos aparecerão aqui.</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Calendário ── */}
        {section === 'calendar' && (
          <View style={{ gap: 16 }}>
            <View style={styles.calCard}>
              <View style={styles.calNav}>
                <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
                  <Feather name="chevron-left" size={20} color={colors.accent} />
                </TouchableOpacity>
                <Text style={styles.calTitle}>{MONTH_NAMES[calMonth]} {calYear}</Text>
                <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
                  <Feather name="chevron-right" size={20} color={colors.accent} />
                </TouchableOpacity>
              </View>
              <View style={styles.calRow}>
                {WEEK.map((d, i) => <Text key={i} style={styles.calWeekDay}>{d}</Text>)}
              </View>
              {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, row) => (
                <View key={row} style={styles.calRow}>
                  {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                    if (day === null) return <View key={col} style={styles.calCell} />;
                    const isToday = isCurrentMonth && day === now.getDate();
                    const hasDl = deadlineDays.has(day);
                    const isSel = selDay === day;
                    return (
                      <TouchableOpacity
                        key={col}
                        style={[styles.calCell, isToday && styles.calToday, isSel && styles.calSelected]}
                        onPress={() => setSelDay(day === selDay ? null : day)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.calDayText, isToday && styles.calTodayText, isSel && styles.calSelectedText]}>
                          {day}
                        </Text>
                        {hasDl && <View style={[styles.calDot, isSel && { backgroundColor: '#fff' }]} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {selDay !== null && (
              <View style={{ gap: 8 }}>
                <Text style={styles.sectionTitle}>Prazos em {selDay} de {MONTH_NAMES[calMonth]}</Text>
                {selDeadlines.length === 0 ? (
                  <Text style={styles.noDeadlines}>Nenhum prazo neste dia.</Text>
                ) : selDeadlines.map(d => (
                  <View key={d.id} style={styles.deadlineCard}>
                    <View style={styles.dlIcon}><Feather name="calendar" size={16} color={colors.accent} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dlTitle}>{d.title}</Text>
                      {d.description && <Text style={styles.dlDesc}>{d.description}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ gap: 8 }}>
              <Text style={styles.sectionTitle}>Próximos Prazos</Text>
              {deadlines.map(d => (
                <View key={d.id} style={styles.deadlineCard}>
                  <View style={styles.dlIcon}><Feather name="calendar" size={16} color={colors.accent} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dlTitle}>{d.title}</Text>
                    <Text style={styles.dlDate}>
                      {new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  segmented: {
    flexDirection: 'row', backgroundColor: colors.surfaceAlt,
    borderRadius: 12, padding: 4, gap: 4,
  },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  segText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  segTextActive: { color: colors.text, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  markAll: { fontSize: 13, fontWeight: '600', color: colors.accent },
  // Alert rows
  alertCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 14, gap: 12, borderWidth: 1, borderColor: colors.border,
  },
  alertCardRead: { opacity: 0.6 },
  alertIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 },
  alertTitleRead: { fontWeight: '500' },
  alertTime: { fontSize: 11, color: colors.textMuted, flexShrink: 0 },
  alertDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 4 },
  // Empty
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  // Calendar
  calCard: {
    backgroundColor: colors.surface, borderRadius: 20,
    padding: 16, gap: 4, borderWidth: 1, borderColor: colors.border,
  },
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  calNavBtn: { padding: 8 },
  calTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  calRow: { flexDirection: 'row' },
  calWeekDay: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.textMuted, paddingVertical: 6 },
  calCell: { flex: 1, aspectRatio: 1, maxHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calToday: { backgroundColor: '#dbeafe' },
  calSelected: { backgroundColor: colors.accent },
  calDayText: { fontSize: 13, color: colors.text, fontWeight: '500' },
  calTodayText: { fontWeight: '700', color: colors.accent },
  calSelectedText: { color: '#fff', fontWeight: '700' },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 1 },
  // Deadlines
  deadlineCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, gap: 12, borderWidth: 1, borderColor: colors.border,
  },
  dlIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  dlTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  dlDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  dlDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  noDeadlines: { fontSize: 13, color: colors.textMuted, paddingVertical: 8 },
});
