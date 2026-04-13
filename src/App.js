import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const transportRates = {
    walk: { label: '🏃 Пешком', rate: 1 },
    bike: { label: '🚲 Велик', rate: 2 },
    ebike: { label: '⚡ Электро', rate: 5 },
    moped: { label: '🛵 Мопед', rate: 8 },
    car: { label: '🚗 Машина', rate: 15 }
};

function App() {
    const [activeTab, setActiveTab] = useState('work');
    const hours = new Date().getHours();
    const isNightTime = hours >= 20 || hours < 6;
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('dark_mode')) ?? isNightTime);

    const [totalEarnings, setTotalEarnings] = useState(() => JSON.parse(localStorage.getItem('earnings')) || 0);
    const [totalTips, setTotalTips] = useState(() => JSON.parse(localStorage.getItem('tips')) || 0);
    const [km, setKm] = useState(() => JSON.parse(localStorage.getItem('km')) || 0);
    const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history')) || []);
    const [transport, setTransport] = useState(() => localStorage.getItem('transport_type') || 'bike');
    const [shiftArchive, setShiftArchive] = useState(() => JSON.parse(localStorage.getItem('shift_archive')) || []);
    
    // НОВАЯ ПРАВКА: Стейт для цели
    const [dailyTarget, setDailyTarget] = useState(() => JSON.parse(localStorage.getItem('daily_target')) || 2000);

    const [currentRate, setCurrentRate] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);

    const theme = {
        bg: darkMode ? '#0f0f0f' : '#f0f2f5',
        card: darkMode ? '#1a1a1a' : '#ffffff',
        text: darkMode ? '#f0f0f0' : '#1c1c1e',
        subText: darkMode ? '#8e8e93' : '#8e8e93',
        border: darkMode ? '#2c2c2e' : '#e5e5ea',
        input: darkMode ? '#2c2c2e' : '#f2f2f7',
        accent: '#34c759',
        danger: '#ff3b30',
        blue: '#007aff'
    };

    useEffect(() => {
        localStorage.setItem('dark_mode', JSON.stringify(darkMode));
        localStorage.setItem('earnings', JSON.stringify(totalEarnings));
        localStorage.setItem('tips', JSON.stringify(totalTips));
        localStorage.setItem('km', JSON.stringify(km));
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('shift_archive', JSON.stringify(shiftArchive));
        localStorage.setItem('transport_type', transport);
        localStorage.setItem('daily_target', JSON.stringify(dailyTarget)); // Сохраняем цель
    }, [darkMode, totalEarnings, totalTips, km, history, shiftArchive, transport, dailyTarget]);

    const fullTotal = totalEarnings + totalTips;
    const expenses = (km * transportRates[transport].rate);
    const netProfit = fullTotal - expenses;
    const earningsPerKm = km > 0 ? (fullTotal / km).toFixed(1) : 0;

    const addDelivery = () => {
        const rate = Number(currentRate);
        const tip = Number(currentTip);
        if (rate === 0 && tip === 0) return;
        const sum = rate + tip;
        if (fullTotal + sum >= dailyTarget && fullTotal < dailyTarget) {
            confetti({ particleCount: 200, spread: 80, origin: { y: 0.7 } });
        }
        setHistory(prev => [{ sum, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: Date.now() }, ...prev].slice(0, 5)); 
        setTotalEarnings(prev => prev + rate);
        setTotalTips(prev => prev + tip);
        setCurrentRate(0); setCurrentTip(0);
    };

    const resetShift = () => {
        if (window.confirm("Очистить текущую смену?")) {
            setTotalEarnings(0); setTotalTips(0); setKm(0); setHistory([]);
        }
    };

    const finishShift = () => {
        if (fullTotal === 0) return;
        if (window.confirm(`Завершить смену? Чистыми: ${netProfit}₽`)) {
            const finishedShift = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                total: fullTotal,
                net: netProfit,
                km: km,
                transport: transportRates[transport].label
            };
            setShiftArchive(prev => [finishedShift, ...prev]);
            setTotalEarnings(0); setTotalTips(0); setKm(0); setHistory([]);
            setActiveTab('archive');
        }
    };

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '15px', color: theme.text, transition: '0.3s', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ maxWidth: '450px', margin: 'auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: theme.subText, fontWeight: 'bold', letterSpacing: '0.5px' }}>ТРАНСПОРТ</span>
                        <select value={transport} onChange={(e) => setTransport(e.target.value)}
                            style={{ background: 'none', border: 'none', color: theme.text, fontSize: '18px', fontWeight: '900', outline: 'none', padding: '5px 0', cursor: 'pointer' }}>
                            {Object.entries(transportRates).map(([key, value]) => (
                                <option key={key} value={key} style={{background: theme.card}}>{value.label}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} style={{ background: theme.card, border: `1px solid ${theme.border}`, width: '40px', height: '40px', borderRadius: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{darkMode ? '☀️' : '🌙'}</button>
                </div>

                {activeTab === 'work' ? (
                    <>
                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ background: darkMode ? 'linear-gradient(145deg, #1e2a3a, #16202c)' : '#ffffff', padding: '20px 15px', borderRadius: '24px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: '10px', color: theme.blue, fontWeight: '800', marginBottom: '5px' }}>ЧИСТЫЙ ПРОФИТ</div>
                                <div style={{ fontSize: '26px', fontWeight: '900', color: theme.accent }}>{netProfit}<span style={{fontSize: '16px'}}> ₽</span></div>
                                <div style={{ fontSize: '11px', color: theme.subText, marginTop: '4px' }}>из {fullTotal}₽</div>
                            </div>
                            <div style={{ background: darkMode ? 'linear-gradient(145deg, #2c1a1a, #201414)' : '#ffffff', padding: '20px 15px', borderRadius: '24px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: '10px', color: theme.danger, fontWeight: '800', marginBottom: '5px' }}>ПРОБЕГ</div>
                                <div style={{ fontSize: '26px', fontWeight: '900' }}>{km}<span style={{fontSize: '16px'}}> км</span></div>
                                <div style={{ fontSize: '11px', color: theme.subText, marginTop: '4px' }}>{earningsPerKm} ₽/км</div>
                            </div>
                        </div>

                        {/* Progress Bar with Editable Target */}
                        <div style={{ background: theme.card, padding: '15px 20px', borderRadius: '20px', marginBottom: '25px', border: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: theme.subText, fontWeight: 'bold' }}>
                                    🎯 ЦЕЛЬ: 
                                    <input 
                                        type="number" 
                                        value={dailyTarget} 
                                        onChange={(e) => setDailyTarget(Number(e.target.value))}
                                        style={{ background: theme.input, border: 'none', color: theme.text, width: '60px', borderRadius: '5px', padding: '2px 5px', fontWeight: '900', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                                    /> ₽
                                </div>
                                <span style={{fontWeight: 'bold'}}>{Math.round((fullTotal / dailyTarget) * 100)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: theme.input, borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min((fullTotal / dailyTarget) * 100, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${theme.accent}, #5cdb7d)`, transition: 'width 0.8s ease' }}></div>
                            </div>
                        </div>

                        {/* Остальной код ввода и кнопок остается без изменений */}
                        <div style={{ background: theme.card, padding: '20px', borderRadius: '24px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <input type="number" inputMode="decimal" value={currentRate || ''} onChange={e => setCurrentRate(e.target.value)} placeholder="Ставка ₽"
                                    style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: theme.input, color: theme.text, fontSize: '18px', fontWeight: '600', outline: 'none' }} 
                                />
                                <input type="number" inputMode="decimal" value={currentTip || ''} onChange={e => setCurrentTip(e.target.value)} placeholder="Чай ₽"
                                    style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: theme.input, color: theme.text, fontSize: '18px', fontWeight: '600', outline: 'none' }} 
                                />
                            </div>
                            <button onClick={addDelivery} style={{ width: '100%', padding: '20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '18px', fontSize: '18px', fontWeight: '900', boxShadow: '0 8px 20px rgba(52, 199, 89, 0.3)' }}>
                                + {Number(currentRate) + Number(currentTip)} ₽
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
                            <button onClick={() => setKm(prev => Math.max(0, prev - 1))} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontWeight: '800' }}>-1</button>
                            <button onClick={() => setKm(km + 1)} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontWeight: '800' }}>+1</button>
                            <button onClick={() => setKm(km + 5)} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: `2px solid ${theme.blue}`, background: theme.card, color: theme.blue, fontWeight: '800' }}>+5</button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '100px' }}>
                            <button onClick={resetShift} style={{ flex: 1, padding: '16px', background: 'none', border: `2px solid ${theme.danger}`, color: theme.danger, borderRadius: '16px', fontWeight: 'bold', fontSize: '12px' }}>🗑️ СБРОС</button>
                            <button onClick={finishShift} style={{ flex: 2, padding: '16px', background: theme.text, color: theme.bg, border: 'none', borderRadius: '16px', fontWeight: '900' }}>🏁 ЗАВЕРШИТЬ СМЕНУ</button>
                        </div>
                    </>
                ) : (
                    <div style={{ background: theme.card, borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '10px', marginBottom: '100px' }}>
                        {shiftArchive.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: theme.subText }}>История пока пуста</p> : 
                            shiftArchive.map(shift => (
                                <div key={shift.id} style={{ padding: '18px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: theme.subText, fontWeight: 'bold' }}>{shift.date} • {shift.transport}</div>
                                        <div style={{ fontSize: '18px', fontWeight: '900' }}>{shift.net} ₽ <span style={{fontSize: '12px', fontWeight: 'normal', color: theme.subText}}>грязными: {shift.total}</span></div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '800', color: theme.blue }}>{shift.km} км</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', height: '70px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderRadius: '25px', display: 'flex', border: `1px solid rgba(255,255,255,0.1)`, justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', zIndex: 1000 }}>
                <div onClick={() => setActiveTab('work')} style={{ textAlign: 'center', color: activeTab === 'work' ? theme.accent : theme.subText, cursor: 'pointer', flex: 1 }}>
                    <div style={{ fontSize: '24px' }}>🚴</div>
                </div>
                <div onClick={() => setActiveTab('archive')} style={{ textAlign: 'center', color: activeTab === 'archive' ? theme.accent : theme.subText, cursor: 'pointer', flex: 1 }}>
                    <div style={{ fontSize: '24px' }}>📁</div>
                </div>
            </div>
        </div>
    );
}

export default App;