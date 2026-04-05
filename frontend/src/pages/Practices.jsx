import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Headphones, Shield, Heart, Waves, CircleDot } from 'lucide-react';

const practices = [
  {
    id: 'safe-place',
    title: 'Безопасное место',
    description: 'Упражнение на создание внутреннего образа безопасного пространства. Помогает снизить тревогу и почувствовать устойчивость.',
    duration: '~5 мин',
    Icon: Shield,
    color: 'from-emerald-400 to-teal-500',
    audio: '/audio/Безопасное место.mp3',
  },
  {
    id: 'self-hug',
    title: 'Самообъятия',
    description: 'Техника саморегуляции через физическое ощущение собственных объятий. Снимает напряжение и даёт чувство поддержки.',
    duration: '~3 мин',
    Icon: Heart,
    color: 'from-pink-400 to-rose-500',
    audio: '/audio/Самообъятия.mp3',
  },
  {
    id: 'stress',
    title: 'Стресс и Перегруз',
    description: 'Медитация для работы со стрессом и эмоциональной перегрузкой. Помогает восстановить внутренний баланс.',
    duration: '~7 мин',
    Icon: Waves,
    color: 'from-blue-400 to-indigo-500',
    audio: '/audio/Стресс_Перегруз.mp3',
  },
  {
    id: 'center',
    title: 'Центр',
    description: 'Практика возвращения в свой центр. Помогает обрести внутреннюю опору и ясность в сложных ситуациях.',
    duration: '~5 мин',
    Icon: CircleDot,
    color: 'from-violet-400 to-purple-500',
    audio: '/audio/Центр.mp3',
  },
];

const Practices = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playTrack = (practice) => {
    if (currentTrack?.id === practice.id) {
      togglePlay();
      return;
    }
    setCurrentTrack(practice);
    setIsPlaying(true);
    setProgress(0);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = practice.audio;
        audioRef.current.volume = volume;
        audioRef.current.play();
      }
    }, 50);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const time = (e.target.value / 100) * duration;
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const playNext = () => {
    if (!currentTrack) return;
    const idx = practices.findIndex((p) => p.id === currentTrack.id);
    const next = practices[(idx + 1) % practices.length];
    playTrack(next);
  };

  const playPrev = () => {
    if (!currentTrack) return;
    const idx = practices.findIndex((p) => p.id === currentTrack.id);
    const prev = practices[(idx - 1 + practices.length) % practices.length];
    playTrack(prev);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-16 fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Headphones className="w-10 h-10 text-white/80" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Практики</h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Аудио-упражнения для саморегуляции и восстановления внутреннего баланса.
            Выберите практику и послушайте в удобном для вас темпе.
          </p>
        </div>

        {/* Карточки практик */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {practices.map((practice, i) => {
            const isActive = currentTrack?.id === practice.id;
            return (
              <div
                key={practice.id}
                className={`group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 transition-all duration-500 cursor-pointer hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl reveal scale-in ${
                  isActive ? 'ring-2 ring-white/50 bg-white/20' : ''
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => playTrack(practice)}
              >
                {/* Иконка и градиент */}
                <div className="flex items-start gap-5 mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${practice.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <practice.Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{practice.title}</h3>
                    <span className="text-white/60 text-sm">{practice.duration}</span>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive && isPlaying
                        ? 'bg-white text-primary scale-110'
                        : 'bg-white/20 text-white group-hover:bg-white group-hover:text-primary'
                    }`}
                  >
                    {isActive && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </div>
                </div>

                <p className="text-white/80 leading-relaxed">{practice.description}</p>

                {/* Прогресс-бар для активного трека */}
                {isActive && duration > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <span>{formatTime(progress)}</span>
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Нижний плеер */}
        {currentTrack && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-gray-200 z-30 fade-in">
            <div className="max-w-5xl mx-auto px-4 py-4">
              {/* Прогресс */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-gray-500 w-10 text-right">{formatTime(progress)}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
                <span className="text-sm text-gray-500 w-10">{formatTime(duration)}</span>
              </div>

              {/* Контролы */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTrack.color} flex items-center justify-center`}
                  >
                    <currentTrack.Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{currentTrack.title}</div>
                    <div className="text-gray-500 text-xs">{currentTrack.duration}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={playPrev} className="p-2 text-gray-600 hover:text-primary transition">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:shadow-lg hover:scale-105 transition"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button onClick={playNext} className="p-2 text-gray-600 hover:text-primary transition">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Скрытый аудио-элемент */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

export default Practices;
