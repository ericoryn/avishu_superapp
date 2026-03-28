import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, updateDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useToast } from '../../components/toast/useToast';
import { STATUS_TRANSITIONS } from '../../constants';
import { SkeletonTaskCard } from '../../components/Skeleton';
import ThemeToggle from '../../components/ThemeToggle';
import { Check, Settings, Scissors, Clock, Package } from 'lucide-react';

export default function ProductionQueue() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const { initTheme } = useThemeStore();
  const toast = useToast();

  useEffect(() => { initTheme(); }, [initTheme]);

  useEffect(() => {
    let loadedSources = 0;
    const checkLoaded = () => { loadedSources++; if (loadedSources >= 2) setIsLoading(false); };

    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['ОФОРМЛЕН', 'НА ПОШИВЕ'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(
        data.sort(
          (a, b) =>
            (a.status === 'НА ПОШИВЕ' ? -1 : 1) - (b.status === 'НА ПОШИВЕ' ? -1 : 1)
        )
      );
      checkLoaded();
    });

    const qCompleted = query(
      collection(db, 'orders'),
      where('status', '==', 'ГОТОВО')
    );
    const unsubCompleted = onSnapshot(qCompleted, (snapshot) => {
      setCompletedTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      checkLoaded();
    });

    return () => { unsubscribe(); unsubCompleted(); };
  }, []);

  const handleCompleteStage = async (task) => {
    const nextStatus = STATUS_TRANSITIONS[task.status];
    if (!nextStatus) {
      toast.warning('НЕВОЗМОЖНО СМЕНИТЬ СТАТУС');
      return;
    }
    try {
      await updateDoc(doc(db, 'orders', task.id), { status: nextStatus });
      if (nextStatus === 'ГОТОВО') {
        toast.success(`✂ ЗАКАЗ ВЫПОЛНЕН — ${task.items?.[0]?.name}`);
      } else {
        toast.info(`НАЧАТ ПОШИВ — ${task.items?.[0]?.name}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('ОШИБКА ОБНОВЛЕНИЯ СТАТУСА');
    }
  };

  return (
    <div
      className="min-h-screen bg-themed text-themed font-sans p-4 md:p-8 lg:p-12"
      style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 border-b-2 border-themed pb-6 md:pb-8 gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-widest">AVISHU</h1>
          <p className="text-sm md:text-xl mt-1 md:mt-2 text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <Settings size={18} /> ТЕРМИНАЛ / {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex gap-2 md:gap-3 flex-1 md:flex-initial items-center min-w-0 stagger-children">
            <div className="border border-themed h-10 px-2 md:px-3 shrink-0 box-border flex items-center justify-center gap-2 flex-1 md:flex-initial min-w-0">
              <span className="text-base md:text-lg font-black tabular-nums leading-none animate-pop">{tasks.length}</span>
              <span className="text-[10px] font-bold text-themed-tertiary uppercase tracking-wide leading-tight">ОЧЕРЕДЬ</span>
            </div>
            <div className="border border-green-500 h-10 px-2 md:px-3 shrink-0 box-border flex items-center justify-center gap-2 flex-1 md:flex-initial min-w-0">
              <span className="text-base md:text-lg font-black tabular-nums text-green-500 leading-none animate-pop" style={{ animationDelay: '0.1s' }}>{completedTasks.length}</span>
              <span className="text-[10px] font-bold text-themed-tertiary uppercase tracking-wide leading-tight">ГОТОВО</span>
            </div>
          </div>
          <ThemeToggle />
          <button
            onClick={logout}
            className="text-xs md:text-sm font-bold uppercase hover:bg-themed-inverse hover:text-themed-inverse transition-colors border border-themed h-10 px-3 md:px-4 shrink-0 box-border flex items-center justify-center"
          >
            ВЫЙТИ
          </button>
        </div>
      </header>

      <div className="flex gap-3 mb-6 md:mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => setShowCompleted(false)}
          className={`font-bold text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 transition-all flex items-center gap-2 btn-brutal ${!showCompleted ? 'bg-themed-inverse text-themed-inverse' : 'border border-themed text-themed-secondary hover:bg-themed-secondary'}`}
        >
          <Clock size={16} /> АКТИВНЫЕ ({tasks.length})
        </button>
        <button
          onClick={() => setShowCompleted(true)}
          className={`font-bold text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 transition-all flex items-center gap-2 btn-brutal ${showCompleted ? 'bg-green-600 text-white' : 'border border-themed text-themed-tertiary hover:border-green-600 hover:text-green-600'}`}
        >
          <Package size={16} /> ГОТОВО ({completedTasks.length})
        </button>
      </div>

      {!showCompleted ? (
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 stagger-children">
          {isLoading ? (
            <>{[1,2,3,4].map(i => <SkeletonTaskCard key={i} />)}</>
          ) : (
            <>
              {tasks.map(task => (
                <div key={task.id} className="border-2 md:border-4 border-white p-4 md:p-8 group transition-all duration-300 relative hover:border-green-500 product-card" style={{ backgroundColor: 'transparent' }}
                     onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(22,163,74,0.05)'; }}
                     onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div className={`absolute top-0 right-0 p-2 md:p-4 text-xs md:text-xl font-bold border-l-2 md:border-l-4 border-b-2 md:border-b-4 ${
                    task.status === 'НА ПОШИВЕ' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white'
                  } group-hover:border-green-500 transition-colors`}>
                    {task.status}
                  </div>

                  <h3 className="text-xl md:text-4xl font-black mb-4 md:mb-8 pt-6 md:pt-8 pr-24 md:pr-0">{task.items.map(i => i.name).join(', ')}</h3>

                  <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-16 opacity-80 text-sm md:text-xl font-bold uppercase">
                    <div className="border border-white p-2 md:p-4">
                      <span className="text-gray-400 text-xs block mb-1">ЗАКАЗ</span>
                      {task.id.slice(0,8)}...
                    </div>
                    <div className="border border-white p-2 md:p-4">
                      <span className="text-gray-400 text-xs block mb-1">КЛИЕНТ</span>
                      <span className="truncate block">{task.clientName || '—'}</span>
                    </div>
                    <div className="border border-white p-2 md:p-4 col-span-2 flex justify-between items-center">
                      <div>
                        <span className="text-gray-400 text-xs block mb-1">ТИП</span>
                        <span className={task.type === 'PREORDER' ? 'text-green-400' : 'text-white'}>
                          {task.type} {task.type === 'PREORDER' && `- ${task.preorderDate}`}
                        </span>
                      </div>
                      <Scissors size={24} className="hidden md:block" />
                    </div>
                  </div>

                  <button
                    onClick={() => handleCompleteStage(task)}
                    className="w-full bg-white text-black hover:bg-green-500 hover:text-white p-4 md:p-8 text-lg md:text-4xl font-black flex items-center justify-center gap-3 md:gap-6 transition-all btn-brutal"
                  >
                    <Check size={28} strokeWidth={4} className="md:w-12 md:h-12" />
                    <span className="md:hidden">
                      {task.status === 'ОФОРМЛЕН' ? 'НА ПОШИВ →' : 'ГОТОВО ✓'}
                    </span>
                    <span className="hidden md:inline">
                      {task.status === 'ОФОРМЛЕН' ? 'НАЧАТЬ ПОШИВ (НА ПОШИВЕ)' : 'ЗАВЕРШИТЬ ЗАКАЗ (ГОТОВО)'}
                    </span>
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-2xl md:text-6xl font-black text-gray-800 tracking-tighter col-span-full py-16 md:py-32 text-center uppercase border-2 md:border-4 border-dashed border-gray-800 animate-fade-in">
                 НЕТ АКТИВНЫХ ЗАДАЧ
                </div>
              )}
            </>
          )}
        </main>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 stagger-children">
          {completedTasks.map(task => (
            <div key={task.id} className="border-2 border-green-800 p-4 md:p-6" style={{ backgroundColor: 'rgba(22,163,74,0.08)' }}>
              <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
                <h3 className="text-lg md:text-2xl font-black text-green-400">{task.items?.map(i => i.name).join(', ')}</h3>
                <span className="bg-green-600 text-white px-2 md:px-3 py-1 text-xs font-bold flex-shrink-0">ГОТОВО</span>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm font-bold text-gray-500">
                <span>ID: {task.id.slice(0,8).toUpperCase()}</span>
                <span>{task.clientName || '—'}</span>
                <span>{task.totalPrice?.toLocaleString()} ₸</span>
              </div>
            </div>
          ))}
          {completedTasks.length === 0 && (
            <div className="text-xl md:text-4xl font-black text-gray-800 col-span-full py-16 md:py-24 text-center border-2 border-dashed border-gray-800 animate-fade-in">
              НЕТ ЗАВЕРШЕННЫХ ЗАКАЗОВ
            </div>
          )}
        </main>
      )}
    </div>
  );
}
