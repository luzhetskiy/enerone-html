#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Демо-данные и статичные SVG-графики для служебных страниц статистики.

Логики на этих страницах нет — это макеты, поэтому графики нарисованы заранее
и лежат в разметке обычным <svg>. Скрипт нужен, только чтобы поменять
демо-цифры: он ПЕРЕСОБИРАЕТ три файла контента целиком, так что правки,
внесённые в них руками, потеряются.

Запуск:  python3 _source/stats_mock.py && python3 _source/build.py
"""


W, H = 720, 250
PAD_L, PAD_R, PAD_T, PAD_B = 52, 52, 14, 30


def smooth(pts):
    """Плавная кривая через точки (Catmull-Rom -> кубические Безье)."""
    if len(pts) < 2:
        return ''
    d = 'M%.1f %.1f' % pts[0]
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        # контрольные точки держим между соседними значениями, иначе кривая
        # перелетает и линия уходит ниже нулевой отметки
        lo, hi = min(p1[1], p2[1]), max(p1[1], p2[1])
        clamp = lambda y: max(lo, min(hi, y))
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, clamp(p1[1] + (p2[1] - p0[1]) / 6.0))
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, clamp(p2[1] - (p3[1] - p1[1]) / 6.0))
        d += ' C%.1f %.1f %.1f %.1f %.1f %.1f' % (c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
    return d


def nice_max(v):
    import math
    if v <= 0:
        return 10
    step = 10 ** math.floor(math.log10(v))
    for m in (1, 2, 2.5, 5, 10):
        if step * m >= v:
            return step * m
    return step * 10


def fmt(v):
    if v >= 1000:
        return format(int(round(v)), ',').replace(',', ' ')
    return str(int(round(v))) if v == int(v) else ('%.1f' % v)


def chart(series, x_labels, right_axis=False, ind=10):
    """series: [{'name','color','values','axis':'left'|'right'}]"""
    pad = ' ' * ind
    inner_w = W - PAD_L - PAD_R
    inner_h = H - PAD_T - PAD_B
    n = len(x_labels)
    xs = [PAD_L + (inner_w * i / (n - 1)) for i in range(n)]

    left = [s for s in series if s.get('axis', 'left') == 'left']
    right = [s for s in series if s.get('axis') == 'right']
    max_r = nice_max(max(max(s['values']) for s in right)) if right else 0
    max_l = nice_max(max(max(s['values']) for s in left)) if left else max_r

    out = []
    a = out.append
    a('<svg class="lk-chart-svg" viewBox="0 0 %d %d" role="img" '
      'aria-label="График: %s">' % (W, H, ', '.join(s['name'] for s in series)))

    # сетка и подписи левой оси
    steps = 5
    for i in range(steps + 1):
        y = PAD_T + inner_h * i / steps
        a('<line class="lk-chart-grid" x1="%d" y1="%.1f" x2="%d" y2="%.1f"/>'
          % (PAD_L, y, W - PAD_R, y))
        val = max_l * (steps - i) / steps
        a('<text class="lk-chart-ax lk-chart-ax--l" x="%d" y="%.1f">%s</text>'
          % (PAD_L - 8, y + 3.5, fmt(val)))
        if right_axis:
            vr = max_r * (steps - i) / steps
            a('<text class="lk-chart-ax lk-chart-ax--r" x="%d" y="%.1f">%s</text>'
              % (W - PAD_R + 8, y + 3.5, fmt(vr)))

    # подписи по X
    for i, lb in enumerate(x_labels):
        a('<text class="lk-chart-x" x="%.1f" y="%d">%s</text>' % (xs[i], H - 8, lb))

    # линии
    for s in series:
        top = max_r if s.get('axis') == 'right' else max_l
        pts = [(xs[i], PAD_T + inner_h * (1 - v / top)) for i, v in enumerate(s['values'])]
        a('<path class="lk-chart-line" style="stroke:%s" d="%s"/>' % (s['color'], smooth(pts)))
        for p in pts:
            a('<circle class="lk-chart-dot" style="fill:%s" cx="%.1f" cy="%.1f" r="3.4"/>'
              % (s['color'], p[0], p[1]))

    a('</svg>')
    return ('\n' + pad).join(out)


def legend(series, ind=10):
    pad = ' ' * ind
    items = []
    for s in series:
        items.append('<span class="lk-chart-key">'
                     '<i style="background:%s"></i>%s</span>' % (s['color'], s['name']))
    return ('\n' + pad).join(['<div class="lk-chart-legend">'] +
                             ['  ' + i for i in items] + ['</div>'])


# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = str(Path(__file__).resolve().parent) + '/'

HEAD = """<!-- ================= ЛК: %(comment)s — начало ================= -->
<div class="lk">
  <div class="lk-layout">

{{SIDEBAR}}

    <div class="lk-content">
      <button type="button" class="lk-burger" data-lk-burger aria-label="Разделы кабинета">
        <span></span><span></span><span></span>
      </button>

      <h1 class="lk-pg-title">%(title)s</h1>
      <div class="lk-pg-sub">Служебный раздел — доступен администраторам личного кабинета</div>
"""

FOOT = """
    </div>
  </div>
</div>
<!-- ================= ЛК: %(comment)s — конец ================= -->
"""


def field(label, kind='date', fid='', options=None, wide=False, value='2026-09-01'):
    cls = 'lk-filter-field' + (' is-wide' if wide else '')
    if kind == 'date':
        ctrl = ('<input class="lk-input lk-date" id="%s" type="date" value="%s">' % (fid, value))
    else:
        opts = '\n'.join('            <option%s>%s</option>'
                         % (' selected' if i == 0 else '', o) for i, o in enumerate(options))
        ctrl = '<select class="lk-select" id="%s">\n%s\n          </select>' % (fid, opts)
    return """        <div class="%s">
          <label class="lk-form-lbl" for="%s">%s</label>
          %s
        </div>""" % (cls, fid, label, ctrl)


def filters(fields, ind=6):
    body = '\n\n'.join(fields)
    return """      <div class="lk-filters lk-filters--stats">
%s

        <div class="lk-filter-field lk-filter-actions">
          <button type="button" class="lk-btn-primary" data-lk-action="Показать статистику">Показать</button>
          <button type="button" class="lk-filter-reset" data-lk-action="Сбросить фильтры статистики">Сбросить</button>
        </div>
      </div>""" % body


def chart_block(series, labels, right_axis=False):
    return """      <div class="lk-panel lk-chart-panel">
        %s

        <div class="lk-chart">
          %s
        </div>
      </div>""" % (legend(series, ind=8), chart(series, labels, right_axis, ind=10))


def xls(title, links):
    items = '\n'.join(
        '        <a class="lk-xls" href="#" data-lk-action="Выгрузить в XLS: %s">'
        '<svg viewBox="0 0 14 14" aria-hidden="true">'
        '<path d="M3 1.5h5l3 3v8H3z"/><path d="M8 1.5v3h3"/>'
        '<path d="M5.4 7.2l3.2 3.2M8.6 7.2l-3.2 3.2" stroke-linecap="round"/></svg>%s</a>' % (t, t)
        for t in links)
    return """      <section class="lk-step lk-step--sep">
        <div class="lk-sec-hdr">
          <h2 class="lk-sec-title lk-sec-title--major">%s</h2>
        </div>
        <div class="lk-xls-list">
%s
        </div>
      </section>""" % (title, items)


DAYS = ['01.09', '02.09', '03.09', '04.09', '05.09', '06.09',
        '07.09', '08.09', '09.09', '10.09']
MONTHS = ['окт', 'ноя', 'дек', 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен']

# ─────────────────────────── 1. Пользователи ───────────────────────────
users_series = [{'name': 'Новые пользователи', 'color': '#62b67c',
                 'values': [118, 132, 96, 171, 154, 143, 168, 149, 205, 188, 162, 197]}]

users = (HEAD % {'comment': 'Отчёт по пользователям', 'title': 'Отчёт по пользователям'} + """
      <div class="lk-panel lk-kpi-panel">
        <div class="lk-kpi-hero">
          <div class="lk-kpi-hero-val">4 563</div>
          <div class="lk-kpi-hero-lbl">пользователей</div>
        </div>

        <div class="lk-kpi-cols">
          <div class="lk-kpi-col">
            <div class="lk-kpi-row"><span class="lk-kpi-k">Общее кол-во пользователей</span><span class="lk-kpi-v">4 563</span></div>
            <div class="lk-kpi-row"><span class="lk-kpi-k">Активные пользователи</span><span class="lk-kpi-v">4 563</span></div>
            <div class="lk-kpi-row"><span class="lk-kpi-k">Не завершили регистрацию</span><span class="lk-kpi-v is-zero">0</span></div>
            <div class="lk-kpi-row"><span class="lk-kpi-k">Заполнили весь профиль</span><span class="lk-kpi-v">9</span></div>
            <div class="lk-kpi-row"><span class="lk-kpi-k">Всего договоров</span><span class="lk-kpi-v">6 036</span></div>
            <div class="lk-kpi-row"><span class="lk-kpi-k">Пользователи с договорами</span><span class="lk-kpi-v">3 639</span></div>
          </div>

          <div class="lk-kpi-col">
            <div class="lk-kpi-row is-long">
              <span class="lk-kpi-k">Уникальные пользователи, заходившие в ЛК за последние 30 дней</span>
              <span class="lk-kpi-v">1 819</span>
            </div>
            <div class="lk-kpi-row is-long">
              <span class="lk-kpi-k">Уникальные пользователи, передававшие показания через ЛК за последние 30 дней</span>
              <span class="lk-kpi-v">1 590</span>
            </div>
            <div class="lk-kpi-row is-long">
              <span class="lk-kpi-k">Договоры, по которым передавали показания через ЛК за последние 30 дней</span>
              <span class="lk-kpi-v">1 939</span>
            </div>
          </div>
        </div>
      </div>

      <section class="lk-step lk-step--sep">
        <div class="lk-sec-hdr">
          <h2 class="lk-sec-title lk-sec-title--major">Данные на графике</h2>
        </div>

""" + filters([
    field('Дата (начало)', 'date', 'lk-st-from'),
    field('Дата (конец)', 'date', 'lk-st-to', value='2026-09-30'),
    field('Детализация', 'select', 'lk-st-step', ['Месяц', 'День', 'Неделя', 'Год']),
]) + "\n\n" + chart_block(users_series, MONTHS) + """
      </section>

""" + xls('Экспорт данных в XLS', [
    'Пользователи с договорами + все другие активные пользователи',
    'Пользователи с договорами',
    'Активные пользователи',
    'Заполнили весь профиль',
]) + FOOT % {'comment': 'Отчёт по пользователям'})

# ─────────────────────────── 2. Платежи ───────────────────────────
pay_series = [
    {'name': 'Сумма платежей', 'color': '#62b67c', 'axis': 'right',
     'values': [14.2e6, 26.1e6, 25.4e6, 1.2e6, 0.8e6, 0.6e6, 1.1e6, 3.4e6, 22.6e6, 16.0e6, 0.2e6]},
    {'name': 'Платежи', 'color': '#f7b114',
     'values': [42, 40, 38, 22, 18, 6, 7, 60, 600, 370, 10]},
]
pay_days = DAYS + ['11.09']

payments = (HEAD % {'comment': 'Статистика по платежам', 'title': 'Статистика по платежам'} + """
      <section class="lk-step">
        <div class="lk-sec-hdr">
          <h2 class="lk-sec-title lk-sec-title--major">Данные на графике</h2>
        </div>

""" + filters([
    field('Дата (начало)', 'date', 'lk-st-from'),
    field('Дата (конец)', 'date', 'lk-st-to', value='2026-09-11'),
    field('Детализация', 'select', 'lk-st-step', ['День', 'Неделя', 'Месяц', 'Год']),
    field('Договор', 'select', 'lk-st-contract',
          ['Все', 'ДЭС740201104', 'ДЭС740201287', 'ДЭС740215171']),
]) + "\n\n" + chart_block(pay_series, pay_days, right_axis=True) + """
      </section>

      <section class="lk-step lk-step--sep">
        <div class="lk-sec-hdr">
          <h2 class="lk-sec-title lk-sec-title--major">
            Суммарно по периоду с 01.09.2026 по 11.09.2026
            <span class="lk-sec-note-inline">все договоры</span>
          </h2>
        </div>

        <div class="lk-panel lk-totals">
          <div class="lk-total">
            <div class="lk-total-val">1 165</div>
            <div class="lk-total-lbl">общее количество платежей</div>
          </div>
          <div class="lk-total">
            <div class="lk-total-val">83 324 054,45 <span class="lk-total-cur">₽</span></div>
            <div class="lk-total-lbl">общая сумма платежей</div>
          </div>
        </div>
      </section>
""" + FOOT % {'comment': 'Статистика по платежам'})

# ─────────────────────────── 3. Показания ───────────────────────────
tr_series = [{'name': 'Передачи', 'color': '#f7b114',
              'values': [101, 68, 38, 15, 1, 0, 0, 0, 0, 0, 0]}]

transfers = (HEAD % {'comment': 'Статистика по переданным показаниям',
                     'title': 'Статистика по переданным показаниям'} + """
      <section class="lk-step">
        <div class="lk-sec-hdr">
          <h2 class="lk-sec-title lk-sec-title--major">Данные на графике</h2>
        </div>

""" + filters([
    field('Дата (начало)', 'date', 'lk-st-from'),
    field('Дата (конец)', 'date', 'lk-st-to', value='2026-09-11'),
    field('Тип передачи', 'select', 'lk-st-kind', ['Ручная', 'Все', 'Файлом', 'По всем ПУ одним файлом']),
    field('Детализация', 'select', 'lk-st-step', ['День', 'Неделя', 'Месяц', 'Год']),
    field('Договор', 'select', 'lk-st-contract',
          ['Все', 'ДЭС740201104', 'ДЭС740201287', 'ДЭС740215171']),
]) + "\n\n" + chart_block(tr_series, pay_days) + """
      </section>

      <section class="lk-step lk-step--sep">
        <div class="lk-sec-hdr">
          <h2 class="lk-sec-title lk-sec-title--major">
            Суммарно по периоду с 01.09.2026 по 11.09.2026
            <span class="lk-sec-note-inline">все договоры</span>
          </h2>
        </div>

        <a class="lk-xls lk-xls--inline" href="#"
           data-lk-action="Лог переданных показаний по выбранным фильтрам">
          <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5h5l3 3v8H3z"/><path d="M8 1.5v3h3"/><path d="M5.4 7.2l3.2 3.2M8.6 7.2l-3.2 3.2" stroke-linecap="round"/></svg>
          Лог переданных показаний пользователями (согласно выбранным фильтрам)
        </a>

        <div class="lk-panel lk-totals lk-totals--one">
          <div class="lk-total">
            <div class="lk-total-val">222</div>
            <div class="lk-total-lbl">количество отправленных показаний в выбранном периоде</div>
          </div>
        </div>
      </section>

""" + xls('Выгрузить данные в XLS', [
    'Лог переданных показаний пользователями (все передачи)',
]) + FOOT % {'comment': 'Статистика по переданным показаниям'})

for name, body in [('lk-stats-users-content.html', users),
                   ('lk-stats-payments-content.html', payments),
                   ('lk-stats-transfers-content.html', transfers)]:
    open(ROOT + name, 'w', encoding='utf-8').write(body)
    print('записан', name, len(body), 'симв.')
