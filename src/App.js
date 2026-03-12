import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

function App() {
    // Навигация: 'work' или 'archive'
    const [activeTab, setActiveTab] = useState('work');
    
    const hours = new Date().getHours();
    const isNightTime = hours >= 20 || hours < 6;
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('dark_mode')) ?? isNightTime);

    // Данные текущей смены
    const [totalEarnings, setTotalEarnings] = useState(() => JSON.parse(localStorage.getItem('earnings')) || 0);
    const [totalTips, setTotalTips] = useState(() => JSON.parse(localStorage.getItem('tips')) || 0);
    const [km, setKm] = useState(() => JSON.parse(localStorage.getItem('km')) || 0);
    const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history')) || []);

    // ГЛОБАЛЬНЫЙ АРХИВ (все прошлые смены)
    const [shiftArchive, setShiftArchive] = useState(() => JSON.parse(localStorage.getItem('shift_archive')) || []);

    const [currentRate, setCurrentRate] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);

    const theme = {
        bg: darkMode ? '#121212' : '#f5f5f5',
        card: darkMode ? '#1e1e1e' : '#ffffff',
        text: darkMode ? '#e0e0e0' : '#333333',
        subText: darkMode ? '#9e9e9e' : '#666666',
        border: darkMode ? '#333333' : '#eeeeee',
        input: darkMode ? '#2d2d2d' : '#ffffff',
        accent: '#28a745'
    };

    useEffect(() => {
        localStorage.setItem('dark_mode', JSON.stringify(darkMode));
        localStorage.setItem('earnings', JSON.stringify(totalEarnings));
        localStorage.setItem('tips', JSON.stringify(totalTips));
        localStorage.setItem('km', JSON.stringify(km));
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('shift_archive', JSON.stringify(shiftArchive));
    }, [darkMode, totalEarnings, totalTips, km, history, shiftArchive]);

    const fullTotal = totalEarnings + totalTips;
    const earningsPerKm = km > 0 ? (fullTotal / km).toFixed(2) : 0;

    const addDelivery = () => {
        const rate = Number(currentRate);
        const tip = Number(currentTip);
        if (rate === 0 && tip === 0) return;
        const sum = rate + tip;
        if (fullTotal + sum >= 1500 && fullTotal < 1500) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setHistory(prev => [{ sum, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: Date.now() }, ...prev].slice(0, 5)); 
        setTotalEarnings(prev => prev + rate);
        setTotalTips(prev => prev + tip);
        setCurrentRate(0); setCurrentTip(0);
    };

    // ФУНКЦИЯ ЗАВЕРШЕНИЯ СМЕНЫ И ОТПРАВКИ В АРХИВ
    const finishShift = () => {
        if (fullTotal === 0) {
            alert("Смена пустая, сохранять нечего!");
            return;
        }
        if (window.confirm(`Завершить смену? Итого: ${fullTotal}₽. Она сохранится в архиве.`)) {
            const finishedShift = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                total: fullTotal,
                km: km,
                eff: earningsPerKm
            };
            setShiftArchive(prev => [finishedShift, ...prev]);
            // Обнуляем текущую смену
            setTotalEarnings(0); setTotalTips(0); setKm(0); setHistory([]);
            setActiveTab('archive'); // Перекидываем в архив посмотреть результат
        }
    };

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '15px', color: theme.text, transition: '0.3s', paddingBottom: '80px' }}>
            <div style={{ background: theme.card, padding: '20px', borderRadius: '24px', maxWidth: '400px', margin: 'auto' }}>
                
                {/* ХЕДЕР */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{activeTab === 'work' ? 'Текущая смена' : 'Архив смен'}</h3>
                    <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', fontSize: '20px' }}>{darkMode ? '☀️' : '🌙'}</button>
                </div>

                {activeTab === 'work' ? (
                    /* СТРАНИЦА РАБОТЫ */
                    <>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input type="number" inputMode="decimal" value={currentRate || ''} onChange={e => setCurrentRate(e.target.value)} placeholder="Ставка"
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, fontSize: '18px' }} 
                            />
                            <input type="number" inputMode="decimal" value={currentTip || ''} onChange={e => setCurrentTip(e.target.value)} placeholder="Чай"
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, fontSize: '18px' }} 
                            />
                        </div>
                        <button onClick={addDelivery} style={{ width: '100%', padding: '18px', background: theme.accent, color: 'white', border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: 'bold' }}>
                            ✅ Добавить: {Number(currentRate) + Number(currentTip)} ₽
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '20px 0' }}>
                            <div style={{ background: darkMode ? '#1a2a3a' : '#f0f7ff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: '#60a5fa' }}>ИТОГО</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{fullTotal} ₽</div>
                            </div>
                            <div style={{ background: darkMode ? '#3a1a1a' : '#fff0f0', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: '#f87171' }}>КМ: {km}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{earningsPerKm} ₽/км</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                            <button onClick={() => setKm(prev => Math.max(0, prev - 1))} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.input, color: theme.text }}>-1</button>
                            <button onClick={() => setKm(km + 1)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.input, color: theme.text }}>+1</button>
                            <button onClick={() => setKm(km + 5)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.input, color: theme.text }}>+5</button>
                        </div>

                        <button onClick={finishShift} style={{ width: '100%', padding: '12px', background: 'none', border: `2px solid ${theme.accent}`, color: theme.accent, borderRadius: '12px', fontWeight: 'bold' }}>
                            🏁 ЗАВЕРШИТЬ СМЕНУ
                        </button>
                    </>
                ) : (
                    /* СТРАНИЦА АРХИВА */
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {shiftArchive.length === 0 ? <p style={{ textAlign: 'center', color: theme.subText }}>Архив пуст</p> : 
                            shiftArchive.map(shift => (
                                <div key={shift.id} style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: theme.subText }}>{shift.date}</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{shift.total} ₽</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '14px' }}>
                                        <div>{shift.km} км</div>
                                        <div style={{ color: theme.accent }}>{shift.eff} ₽/км</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>

            {/* НИЖНЯЯ НАВИГАЦИЯ */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', background: theme.card, display: 'flex', borderTop: `1px solid ${theme.border}`, justifyContent: 'space-around', alignItems: 'center' }}>
                <div onClick={() => setActiveTab('work')} style={{ textAlign: 'center', color: activeTab === 'work' ? theme.accent : theme.subText, cursor: 'pointer' }}>
                    <div style={{ fontSize: '20px' }}>🚲</div>
                    <div style={{ fontSize: '12px' }}>Работа</div>
                </div>
                <div onClick={() => setActiveTab('archive')} style={{ textAlign: 'center', color: activeTab === 'archive' ? theme.accent : theme.subText, cursor: 'pointer' }}>
                    <div style={{ fontSize: '20px' }}>📋</div>
                    <div style={{ fontSize: '12px' }}>Архив</div>
                </div>
            </div>
        </div>
    );
}

export default App;