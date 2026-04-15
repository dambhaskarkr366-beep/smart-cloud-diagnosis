import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CalendarDays,
  CloudSun,
  Clock3,
  Link2,
  MapPin,
  Mic,
  MicOff,
  NotebookPen,
  Send,
  TriangleAlert,
  UserRound,
  Wand2,
} from 'lucide-react';
import {
  buildWeatherWarning,
  emptyDraft,
  extractScheduleDraft,
  type ScheduleDraft,
} from '../lib/voiceSchedule';

interface VoiceScheduleProps {
  onNavigate: () => void;
}

type SavedSchedule = ScheduleDraft & { id: number; createdAt: string };

type SpeechRecognitionApi = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionApi;

type SpeechRecognitionEvent = {
  results: ArrayLike<{
    isFinal: boolean;
    0: {
      transcript: string;
    };
  }>;
};

type WeatherSummary = {
  city: string;
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  weatherCode: number;
  warning: string;
};

const dayWords = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function pad(num: number): string {
  return String(num).padStart(2, '0');
}

function toGoogleCalendarDate(date: string, timeRange: string, isEnd = false): string {
  const [startTime, endTime] = timeRange.split('-');
  const picked = isEnd ? (endTime || startTime || '10:00') : (startTime || '09:00');
  const [hour, minute] = picked.split(':').map(Number);
  const dt = new Date(`${date}T00:00:00`);
  dt.setHours(hour, minute || 0, 0, 0);
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
}

function buildScheduleMessage(draft: ScheduleDraft): string {
  return [
    `事项：${draft.task}`,
    `日期：${draft.normalizedDate || '待确认'}`,
    `时间：${draft.normalizedTimeRange || draft.time || '待确认'}`,
    `地点：${draft.location || '待确认'}`,
    `参与人：${draft.people || '待确认'}`,
    `注意事项：${draft.notes || '无'}`,
  ].join('\n');
}

export default function VoiceSchedule({ onNavigate }: VoiceScheduleProps) {
  const [rawInput, setRawInput] = useState('后天早上和王工在上海张江A栋3层会议室做设备巡检复盘，记得带故障报告。');
  const [draft, setDraft] = useState<ScheduleDraft>(emptyDraft);
  const [saved, setSaved] = useState<SavedSchedule[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [feishuWebhook, setFeishuWebhook] = useState('');
  const [dingtalkWebhook, setDingtalkWebhook] = useState('');
  const recognitionRef = useRef<SpeechRecognitionApi | null>(null);

  const browserSupportsSpeech = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as Window & { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition
    );
  }, []);

  useEffect(() => {
    setGoogleConnected(localStorage.getItem('voiceScheduleGoogleConnected') === '1');
    setFeishuWebhook(localStorage.getItem('voiceScheduleFeishuWebhook') || '');
    setDingtalkWebhook(localStorage.getItem('voiceScheduleDingWebhook') || '');
  }, []);

  const parseInput = () => {
    if (!rawInput.trim()) {
      setErrorMsg('请先说一句话或输入你的日程。');
      return;
    }
    setErrorMsg('');
    setDraft(extractScheduleDraft(rawInput));
  };

  const toggleListening = () => {
    if (!browserSupportsSpeech) {
      setErrorMsg('当前浏览器不支持语音识别，请使用 Chrome 或 Edge 最新版。');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const Ctor = (
      (window as Window & { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition
    ) as SpeechRecognitionCtor;

    const recognition = new Ctor();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      setRawInput(transcript.trim());
    };

    recognition.onerror = (event: { error: string }) => {
      setErrorMsg(`语音识别失败：${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setErrorMsg('');
  };

  const saveSchedule = () => {
    if (!draft.task) {
      setErrorMsg('请先完成识别，再保存日程。');
      return;
    }

    setSaved((prev) => [
      {
        ...draft,
        id: Date.now(),
        createdAt: new Date().toLocaleString('zh-CN'),
      },
      ...prev,
    ]);
    setErrorMsg('');
  };

  const fetchWeatherAndAlert = async () => {
    if (!draft.location || !draft.normalizedDate) {
      setErrorMsg('请先识别出地点和日期，再获取天气预警。');
      return;
    }

    setWeatherLoading(true);
    setErrorMsg('');

    try {
      const geoResp = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(draft.location)}&count=1&language=zh&format=json`,
      );
      const geo = (await geoResp.json()) as {
        results?: Array<{ latitude: number; longitude: number; name: string }>;
      };

      const first = geo.results?.[0];
      if (!first) {
        throw new Error('未找到可用地理坐标，请在地点中补充城市名。');
      }

      const forecastResp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${first.latitude}&longitude=${first.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&start_date=${draft.normalizedDate}&end_date=${draft.normalizedDate}`,
      );

      const forecast = (await forecastResp.json()) as {
        daily?: {
          weathercode: number[];
          temperature_2m_max: number[];
          temperature_2m_min: number[];
          precipitation_probability_max: number[];
        };
      };

      const day = forecast.daily;
      if (!day) throw new Error('天气服务暂不可用，请稍后重试。');

      const code = day.weathercode?.[0] ?? 0;
      const precipitation = day.precipitation_probability_max?.[0] ?? 0;

      setWeather({
        city: first.name,
        date: draft.normalizedDate,
        maxTemp: day.temperature_2m_max?.[0] ?? 0,
        minTemp: day.temperature_2m_min?.[0] ?? 0,
        precipitation,
        weatherCode: code,
        warning: buildWeatherWarning(code, precipitation),
      });
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : '天气查询失败，请稍后再试。');
    } finally {
      setWeatherLoading(false);
    }
  };

  const scheduleMessage = useMemo(() => buildScheduleMessage(draft), [draft]);

  const googleCalendarUrl = useMemo(() => {
    if (!draft.normalizedDate) return '';
    const start = toGoogleCalendarDate(draft.normalizedDate, draft.normalizedTimeRange);
    const end = toGoogleCalendarDate(draft.normalizedDate, draft.normalizedTimeRange, true);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: draft.task || '新的日程',
      dates: `${start}/${end}`,
      details: `${scheduleMessage}${weather ? `\n\n天气提醒：${weather.warning}` : ''}`,
      location: draft.location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [draft, scheduleMessage, weather]);

  const gmailDraftUrl = useMemo(() => {
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      su: `日程提醒：${draft.task || '待确认事项'}`,
      body: `${scheduleMessage}${weather ? `\n\n天气预警：${weather.warning}` : ''}`,
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }, [draft.task, scheduleMessage, weather]);

  const sendToWebhook = async (url: string, platform: 'feishu' | 'dingtalk') => {
    if (!url) {
      setErrorMsg(`${platform === 'feishu' ? '飞书' : '钉钉'} Webhook 不能为空。`);
      return;
    }

    try {
      const payload =
        platform === 'feishu'
          ? { msg_type: 'text', content: { text: `${scheduleMessage}\n${weather ? `天气：${weather.warning}` : ''}` } }
          : { msgtype: 'text', text: { content: `${scheduleMessage}\n${weather ? `天气：${weather.warning}` : ''}` } };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error('Webhook 推送失败，请检查机器人权限或地址。');
      setErrorMsg(`${platform === 'feishu' ? '飞书' : '钉钉'} 已成功推送。`);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : '推送失败。');
    }
  };

  const persistHook = (key: string, value: string) => {
    localStorage.setItem(key, value);
    setErrorMsg('已保存连接配置。');
  };

  return (
    <div className="p-8 bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-primary mb-1">语音日程助手（标准化 + 外部连接）</h1>
              <p className="text-sm text-on-surface-variant">支持自然语言时间标准化、Google/Gmail、飞书/钉钉推送，以及次日天气与异常提醒。</p>
            </div>
            <button
              onClick={onNavigate}
              className="px-4 py-2 text-sm rounded-full border border-outline-variant/30 hover:bg-surface-container transition-colors"
            >
              返回仪表盘
            </button>
          </div>

          <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 space-y-3">
            <label className="text-sm font-medium text-on-surface">语音转写 / 文本输入</label>
            <textarea
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              className="w-full min-h-28 rounded-lg border border-outline-variant/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="例如：后天早上在北京总部会议室和李工开排障复盘，记得带验收单。"
            />

            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleListening}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-white hover:opacity-90'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? '停止录音' : '开始语音输入'}
              </button>

              <button
                onClick={parseInput}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary-container text-on-secondary-container hover:opacity-90 transition-colors flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                AI自动识别与标准化
              </button>

              <button
                onClick={saveSchedule}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-tertiary-container text-on-tertiary-container hover:opacity-90 transition-colors"
              >
                保存到日程清单
              </button>

              <button
                onClick={fetchWeatherAndAlert}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <CloudSun className="w-4 h-4" />
                查询天气与突发预警
              </button>
            </div>

            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            {!browserSupportsSpeech && <p className="text-xs text-on-surface-variant">提示：当前环境不支持 Web Speech API，可手动输入文本后点击“AI自动识别与标准化”。</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">识别结果</h2>
            <div className="space-y-4 text-sm">
              <Field label="事项" value={draft.task} icon={<NotebookPen className="w-4 h-4" />} />
              <Field label="原始时间描述" value={draft.time} icon={<Clock3 className="w-4 h-4" />} />
              <Field label="标准化日期" value={draft.normalizedDate ? `${draft.normalizedDate}（${dayWords[new Date(`${draft.normalizedDate}T00:00:00`).getDay()]}）` : ''} icon={<CalendarDays className="w-4 h-4" />} />
              <Field label="标准化时间段" value={draft.normalizedTimeRange} icon={<Clock3 className="w-4 h-4" />} />
              <Field label="地点" value={draft.location} icon={<MapPin className="w-4 h-4" />} />
              <Field label="人物" value={draft.people} icon={<UserRound className="w-4 h-4" />} />
              <Field label="注意事项" value={draft.notes} icon={<CalendarDays className="w-4 h-4" />} />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold">对接与同步</h2>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  localStorage.setItem('voiceScheduleGoogleConnected', '1');
                  setGoogleConnected(true);
                  setErrorMsg('Google 连接状态已标记，点击下方按钮可创建日历事件。');
                }}
                className="px-4 py-2 rounded-lg text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-left"
              >
                {googleConnected ? '✅ Google 已连接（本地标记）' : '连接 Google（本地授权占位）'}
              </button>

              <div className="flex flex-wrap gap-3">
                <a href={googleCalendarUrl || '#'} target="_blank" rel="noreferrer" className={`px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 ${googleCalendarUrl ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500 pointer-events-none'}`}>
                  <Link2 className="w-4 h-4" />
                  写入 Google Calendar
                </a>
                <a href={gmailDraftUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 inline-flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  生成 Gmail 草稿
                </a>
              </div>

              <div className="rounded-lg border border-outline-variant/20 p-3 space-y-2">
                <p className="text-sm font-medium">飞书机器人 Webhook</p>
                <input
                  value={feishuWebhook}
                  onChange={(event) => setFeishuWebhook(event.target.value)}
                  placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                  className="w-full rounded-md border border-outline-variant/30 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => persistHook('voiceScheduleFeishuWebhook', feishuWebhook)} className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200">保存</button>
                  <button onClick={() => sendToWebhook(feishuWebhook, 'feishu')} className="px-3 py-1.5 text-sm rounded-md bg-primary text-white">推送到飞书</button>
                </div>
              </div>

              <div className="rounded-lg border border-outline-variant/20 p-3 space-y-2">
                <p className="text-sm font-medium">钉钉机器人 Webhook</p>
                <input
                  value={dingtalkWebhook}
                  onChange={(event) => setDingtalkWebhook(event.target.value)}
                  placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
                  className="w-full rounded-md border border-outline-variant/30 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => persistHook('voiceScheduleDingWebhook', dingtalkWebhook)} className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200">保存</button>
                  <button onClick={() => sendToWebhook(dingtalkWebhook, 'dingtalk')} className="px-3 py-1.5 text-sm rounded-md bg-primary text-white">推送到钉钉</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {weather && (
          <section className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-3">次日天气与突发情况提醒</h2>
            <div className="text-sm space-y-2">
              <p>📍 {weather.city} · {weather.date}</p>
              <p>🌡️ {weather.minTemp}°C ~ {weather.maxTemp}°C，降雨概率 {weather.precipitation}%</p>
              <p>🧭 weather code: {weather.weatherCode}</p>
              <p className="flex items-center gap-2 text-amber-600"><TriangleAlert className="w-4 h-4" />{weather.warning}</p>
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">我的日程清单</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {saved.length === 0 ? (
              <p className="text-sm text-on-surface-variant">还没有保存的日程，先试试语音输入一句话吧。</p>
            ) : (
              saved.map((item) => (
                <article key={item.id} className="rounded-lg border border-outline-variant/20 p-3 space-y-1">
                  <p className="text-xs text-on-surface-variant">创建于 {item.createdAt}</p>
                  <p className="font-semibold">{item.task}</p>
                  <p className="text-sm">📅 {item.normalizedDate || '待补充'} {item.normalizedTimeRange || item.time || ''}</p>
                  <p className="text-sm">📍 {item.location || '待补充'}</p>
                  <p className="text-sm">👤 {item.people || '待补充'}</p>
                  <p className="text-sm">📝 {item.notes || '无'}</p>
                </article>
              ))
            )}
          </div>
        </section>

        {weatherLoading && <p className="text-sm text-on-surface-variant">正在获取天气与风险信息...</p>}
      </div>
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-outline-variant/20 px-3 py-2">
      <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className="font-medium text-on-surface">{value || '未识别到，建议手动补充'}</p>
    </div>
  );
}
