import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWardrobe } from '../contexts/WardrobeContext';
import { type ItemDoc } from '../services/firestoreItems';
import { getCalendarMonth, setCalendarEntry, type CalendarEntry, type OutfitSet } from '../services/firestoreCalendar';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const { user } = useAuth();
  const { items, fits } = useWardrobe();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [cache, setCache] = useState<Record<string, CalendarEntry[]>>({});
  const [loading, setLoading] = useState(true);

  function monthKey(y: number, m: number) { return `${y}-${String(m).padStart(2, '0')}`; }

  function adjacentMonths(y: number, m: number): [number, number][] {
    const prev: [number, number] = m === 1 ? [y - 1, 12] : [y, m - 1];
    const next: [number, number] = m === 12 ? [y + 1, 1] : [y, m + 1];
    return [prev, [y, m], next];
  }

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const months = adjacentMonths(year, month);
    const uncached = months.filter(([y, m]) => !cache[monthKey(y, m)]);

    Promise.all(
      uncached.map(([y, m]) => getCalendarMonth(user.uid, y, m).then(data => ({ key: monthKey(y, m), data })))
    ).then(results => {
      const newCache = { ...cache };
      for (const r of results) newCache[r.key] = r.data;
      setCache(newCache);
      setEntries(newCache[monthKey(year, month)] ?? []);
      setLoading(false);
    });
  }, [user]);

  // Sheet state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<'menu' | 'fits' | 'items' | null>(null);
  const [pendingOutfit, setPendingOutfit] = useState<OutfitSet>({ itemIds: [] });
  const [saving, setSaving] = useState(false);

  // Weather
  const [weather, setWeather] = useState<{ temp: number; code: number; city: string } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  async function fetchWeather(lat: number, lon: number) {
    try {
      const [weatherRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`),
      ]);
      const weatherData = await weatherRes.json();
      const geoData = await geoRes.json();
      const city = geoData.address?.city || geoData.address?.town || geoData.address?.county || '';
      setWeather({ temp: Math.round(weatherData.current.temperature_2m), code: weatherData.current.weather_code, city });
    } catch { /* */ }
    setWeatherLoading(false);
  }

  useEffect(() => {
    if (!navigator.geolocation) { setWeatherLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => setWeatherLoading(false),
      { timeout: 10000 }
    );
  }, []);

  // When month changes, use cache or fetch
  useEffect(() => {
    if (!user) return;
    const key = monthKey(year, month);
    if (cache[key]) {
      setEntries(cache[key]);
      // Preload adjacent months in background
      const months = adjacentMonths(year, month);
      const uncached = months.filter(([y, m]) => !cache[monthKey(y, m)]);
      if (uncached.length > 0) {
        Promise.all(uncached.map(([y, m]) => getCalendarMonth(user.uid, y, m).then(data => ({ key: monthKey(y, m), data })))).then(results => {
          setCache(prev => {
            const next = { ...prev };
            for (const r of results) next[r.key] = r.data;
            return next;
          });
        });
      }
    } else {
      setLoading(true);
      getCalendarMonth(user.uid, year, month).then(data => {
        setCache(prev => ({ ...prev, [key]: data }));
        setEntries(data);
        setLoading(false);
        // Preload adjacent
        const months = adjacentMonths(year, month).filter(([y, m]) => !cache[monthKey(y, m)] && monthKey(y, m) !== key);
        Promise.all(months.map(([y, m]) => getCalendarMonth(user.uid, y, m).then(d => ({ key: monthKey(y, m), data: d })))).then(results => {
          setCache(prev => {
            const next = { ...prev };
            for (const r of results) next[r.key] = r.data;
            return next;
          });
        });
      });
    }
  }, [user, year, month]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function getEntry(date: string): CalendarEntry | undefined {
    return entries.find(e => e.date === date);
  }

  function dateStr(day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function openDate(day: number) {
    const d = dateStr(day);
    setSelectedDate(d);
    setSheetMode('menu');
    setPendingOutfit({ itemIds: [] });
  }

  function updateEntries(date: string, outfits: CalendarEntry['outfits']) {
    const entry: CalendarEntry = { date, userId: user!.uid, outfits };
    setEntries(prev => [...prev.filter(e => e.date !== date), entry]);
    const key = monthKey(year, month);
    setCache(prev => ({
      ...prev,
      [key]: [...(prev[key] ?? []).filter(e => e.date !== date), entry],
    }));
  }

  async function addFitToDate(fitId: string) {
    if (!user || !selectedDate) return;
    const existing = getEntry(selectedDate);
    const outfits = existing?.outfits ?? [];
    if (outfits.length >= 3) return;
    const newOutfits = [...outfits, { fitId, itemIds: [] }];
    setSaving(true);
    await setCalendarEntry(user.uid, { date: selectedDate, outfits: newOutfits });
    updateEntries(selectedDate, newOutfits);
    setSaving(false);
    setSheetMode(null);
    setSelectedDate(null);
  }

  function toggleItem(itemId: string) {
    setPendingOutfit(prev => ({
      ...prev,
      itemIds: prev.itemIds.includes(itemId)
        ? prev.itemIds.filter(id => id !== itemId)
        : prev.itemIds.length < 10 ? [...prev.itemIds, itemId] : prev.itemIds,
    }));
  }

  async function saveCustomOutfit(alsoSaveAsFit: boolean) {
    if (!user || !selectedDate || pendingOutfit.itemIds.length === 0) return;
    const existing = getEntry(selectedDate);
    const outfits = existing?.outfits ?? [];
    if (outfits.length >= 3) return;

    let fitId: string | null = null;
    if (alsoSaveAsFit) {
      const { createFit } = await import('../services/firestoreFits');
      fitId = await createFit(user.uid, {
        name: `Outfit ${selectedDate}`,
        headwear: null, top: null, outer: null, bottom: null, shoes: null,
        accessories: [],
      });
    }

    const newOutfits = [...outfits, { fitId, itemIds: pendingOutfit.itemIds }];
    setSaving(true);
    await setCalendarEntry(user.uid, { date: selectedDate, outfits: newOutfits });
    updateEntries(selectedDate, newOutfits);
    setSaving(false);
    setSheetMode(null);
    setSelectedDate(null);
  }

  // Calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--bg)', paddingBottom: 80 }}>
      {/* Month/Year header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{MONTHS[month - 1]}</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>{year}</p>
        </div>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Weather widget */}
      {weather && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{weatherIcon(weather.code)}</span>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{weather.temp}°C</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-tertiary)' }}>{weather.city}</p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
              {clothingAdvice(weather.temp, weather.code)}
            </p>
          </div>
        </div>
      )}
      {!weather && weatherLoading && (
        <div style={{ padding: '0 16px 12px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>Loading weather…</p>
        </div>
      )}
      {!weather && !weatherLoading && (
        <div style={{ padding: '0 16px 12px' }}>
          <button onClick={() => {
            setWeatherLoading(true);
            navigator.geolocation?.getCurrentPosition(
              (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
              () => setWeatherLoading(false),
              { timeout: 10000 }
            );
          }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'var(--bg)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12 }}>
            <span>🌤️</span> Enable weather
          </button>
        </div>
      )}

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px 8px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', padding: '0 8px', flex: 1, overflow: 'hidden' }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} style={{ borderTop: '1px solid var(--border)', borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none' }} />;
          const d = dateStr(day);
          const entry = getEntry(d);
          const isToday = d === todayStr;
          const hasOutfits = entry && entry.outfits.length > 0;

          const thumbs: string[] = [];
          if (entry) {
            for (const outfit of entry.outfits) {
              if (outfit.fitId) {
                const fit = fits.find(f => f.id === outfit.fitId);
                if (fit) {
                  // Collect in outfit order: top, bottom, shoes
                  for (const itemId of [fit.top, fit.outer, fit.bottom, fit.shoes, fit.headwear, ...(fit.accessories ?? [])]) {
                    if (itemId && thumbs.length < 4) {
                      const item = items.find(it => it.id === itemId);
                      if (item) thumbs.push(item.imageUrl);
                    }
                  }
                }
              }
              for (const itemId of outfit.itemIds) {
                if (thumbs.length < 4) {
                  const item = items.find(it => it.id === itemId);
                  if (item) thumbs.push(item.imageUrl);
                }
              }
            }
          }

          return (
            <button key={day} onClick={() => openDate(day)}
              style={{ borderTop: '1px solid var(--border)', borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: 2, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <span style={{ fontSize: 10, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--bg)' : 'var(--text-secondary)', position: 'absolute', top: 2, left: 3, zIndex: 2, background: isToday ? 'var(--text)' : 'none', borderRadius: '50%', width: isToday ? 18 : 'auto', height: isToday ? 18 : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{day}</span>
              {thumbs.length > 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, position: 'relative' }}>
                  {thumbs.slice(0, 3).map((url, j) => (
                    <img key={j} src={url} alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 3, position: 'absolute', top: 12 + j * 5, left: '50%', transform: `translateX(${-50 + j * 12}%)`, zIndex: 3 - j, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                  ))}
                </div>
              )}
              {hasOutfits && (
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 5, height: 5, borderRadius: '50%', background: '#3b82f6' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Today's Fit — above bottom nav */}
      {(() => {
        const todayEntry = getEntry(todayStr);
        const todayThumbs: { url: string; name: string }[] = [];
        if (todayEntry) {
          for (const outfit of todayEntry.outfits) {
            if (outfit.fitId) {
              const fit = fits.find(f => f.id === outfit.fitId);
              if (fit) {
                for (const itemId of [fit.top, fit.outer, fit.bottom, fit.shoes, fit.headwear]) {
                  if (itemId) { const item = items.find(it => it.id === itemId); if (item) todayThumbs.push({ url: item.imageUrl, name: item.name ?? item.categoryId }); }
                }
              }
            }
            for (const itemId of outfit.itemIds) {
              const item = items.find(it => it.id === itemId);
              if (item) todayThumbs.push({ url: item.imageUrl, name: item.name ?? item.categoryId });
            }
          }
        }
        return (
          <div style={{ padding: '14px 16px 10px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Today's Fit</p>
              <button onClick={() => openDate(today.getDate())}
                style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                {todayThumbs.length > 0 ? 'Edit' : ''}
              </button>
            </div>
            {todayThumbs.length > 0 ? (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                {todayThumbs.map((t, i) => (
                  <div key={i} style={{ width: 60, flexShrink: 0 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-secondary)', border: '2px solid var(--border-strong)' }}>
                      <img src={t.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={() => openDate(today.getDate())}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: 'var(--text)', cursor: 'pointer', color: 'var(--bg)', fontSize: 14, fontWeight: 600 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Set today's outfit
              </button>
            )}
          </div>
        );
      })()}

      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', opacity: 0.8, zIndex: 5 }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading…</p>
        </div>
      )}

      {/* Bottom sheet — menu */}
      {selectedDate && sheetMode === 'menu' && (
        <>
          <div onClick={() => { setSheetMode(null); setSelectedDate(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: 'var(--text)' }}>{selectedDate}</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
              {(getEntry(selectedDate)?.outfits.length ?? 0)}/3 outfits set
            </p>
            <button onClick={() => setSheetMode('fits')} disabled={(getEntry(selectedDate)?.outfits.length ?? 0) >= 3}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', opacity: (getEntry(selectedDate)?.outfits.length ?? 0) >= 3 ? 0.4 : 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth={1.8} style={{ width: 20, height: 20 }}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Choose a saved fit</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>{fits.length} fits available</p>
              </div>
            </button>
            <button onClick={() => setSheetMode('items')} disabled={(getEntry(selectedDate)?.outfits.length ?? 0) >= 3}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', opacity: (getEntry(selectedDate)?.outfits.length ?? 0) >= 3 ? 0.4 : 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth={1.8} style={{ width: 20, height: 20 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Pick items manually</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>Choose individual pieces</p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Fits picker */}
      {selectedDate && sheetMode === 'fits' && (
        <>
          <div onClick={() => setSheetMode('menu')} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text)' }}>Choose a fit</p>
            {fits.length === 0 && <p style={{ fontSize: 14, color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>No fits saved yet</p>}
            {fits.map(fit => {
              const fitItemIds = [fit.headwear, fit.top, fit.outer, fit.bottom, fit.shoes, ...(fit.accessories ?? [])].filter(Boolean) as string[];
              const fitItems = fitItemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as ItemDoc[];
              return (
                <button key={fit.id} onClick={() => addFitToDate(fit.id!)} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexShrink: 0 }}>
                    {fitItems.slice(0, 3).map((item, i) => (
                      <img key={item.id} src={item.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--bg)', marginLeft: i > 0 ? -10 : 0, background: 'var(--bg-secondary)' }} />
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fit.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>{fitItems.length} pieces</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Items picker */}
      {selectedDate && sheetMode === 'items' && (
        <>
          <div onClick={() => setSheetMode('menu')} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '20px 20px 0 0', zIndex: 110, padding: '20px 16px 36px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text)' }}>Pick items</p>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{pendingOutfit.itemIds.length} selected</span>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, marginBottom: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {items.map(item => {
                  const sel = pendingOutfit.itemIds.includes(item.id!);
                  return (
                    <button key={item.id} onClick={() => toggleItem(item.id!)}
                      style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: sel ? '3px solid var(--text)' : '3px solid transparent', background: 'var(--bg-secondary)', cursor: 'pointer', padding: 0, position: 'relative' }}>
                      <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {sel && (
                        <div style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth={3} style={{ width: 12, height: 12 }}><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => saveCustomOutfit(false)} disabled={saving || pendingOutfit.itemIds.length === 0}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: pendingOutfit.itemIds.length === 0 ? 0.4 : 1 }}>
                Add to day
              </button>
              <button onClick={() => saveCustomOutfit(true)} disabled={saving || pendingOutfit.itemIds.length === 0}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: pendingOutfit.itemIds.length === 0 ? 0.4 : 1 }}>
                Add + Save as fit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// WMO weather code to emoji + label
function weatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

function weatherLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Cloudy';
}

function clothingAdvice(temp: number, code: number): string {
  let base = '';
  if (temp >= 35) base = 'Stay cool — go for the lightest, most breathable pieces you have';
  else if (temp >= 28) base = 'Keep it light — shorts, tees, and airy fabrics work best';
  else if (temp >= 22) base = 'Nice out — a comfy top and jeans should do the trick';
  else if (temp >= 16) base = 'A bit cool — throw on a light jacket or long sleeves';
  else if (temp >= 10) base = 'Getting chilly — layer up with a sweater and jacket';
  else if (temp >= 0) base = 'Bundle up — warm coat, scarf, and layers are your friend';
  else base = 'Freezing — go full winter mode, thermal everything';

  const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
  const isSnow = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
  const isStorm = code >= 95;
  const isFog = code >= 45 && code <= 48;

  if (isStorm) return base + '. Grab a waterproof jacket just in case';
  if (isSnow) return base + '. Waterproof boots are a must today';
  if (isRain) return base + '. Don\'t forget a rain layer';
  if (isFog) return base + '. Wear something visible';
  return base;
}
