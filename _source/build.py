#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Сборка локальных страниц ЛК.

Шапка, подвал и offcanvas-меню берутся из сохранённой копии боевой страницы
(_source/lk-test-original.html), пути к статике переписываются на локальную
папку assets/site/, ссылки на разделы сайта — на абсолютные enerone.ru.

Контент ЛК подключается из отдельных файлов _source/<page>-content.html,
стили и скрипты ЛК — из assets/lk/.

Запуск:  python3 _source/build.py
"""

import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_source" / "lk-test-original.html"

SITE = "https://enerone.ru"

# Страницы ЛК
PAGES = [
    {
        "out": "index.html",
        "content": "lk-content.html",
        "nav": "home",
        "title": "Личный кабинет — Договоры | ООО «ЭСК Новая энергия»",
    },
    {
        "out": "readings.html",
        "content": "lk-readings-content.html",
        "nav": "readings",
        "title": "Передача показаний | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/consumption-chart.css",
                "assets/lk/css/lk-readings.css"],
        "js":  ["assets/lk/js/consumption-chart.js",
                "assets/lk/js/lk-readings.js"],
    },
    {
        "out": "feedback.html",
        "content": "lk-feedback-content.html",
        "nav": "messages",
        "title": "Сообщения | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-feedback.css"],
        "js":  ["assets/lk/js/lk-feedback.js"],
    },
    {
        "out": "feedback-sent.html",
        "content": "lk-feedback-sent-content.html",
        "nav": "messages",
        "title": "Обращение отправлено | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-feedback.css"],
        "js":  ["assets/lk/js/lk-feedback.js"],
    },
    {
        "out": "history.html",
        "content": "lk-history-content.html",
        "nav": "invoices",
        "title": "Счета | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-history.css"],
        "js":  ["assets/lk/js/lk-history.js"],
    },
    {
        "out": "settlements.html",
        "content": "lk-settlements-content.html",
        "nav": "acts",
        "title": "Акты сверки | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-settlements.css"],
        "js":  ["assets/lk/js/lk-settlements.js"],
    },
    {
        "out": "payments.html",
        "content": "lk-payments-content.html",
        "nav": "payments",
        "title": "Платежи | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-payments.css"],
        "js":  ["assets/lk/js/lk-payments.js"],
    },
    {
        "out": "autopayments.html",
        "content": "lk-autopayments-content.html",
        "nav": "autopayments",
        "title": "Автоплатежи | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-autopayments.css"],
        "js":  ["assets/lk/js/lk-autopayments.js"],
    },
    {
        "out": "stats-users.html",
        "content": "lk-stats-users-content.html",
        "nav": "stats-users",
        "title": "Отчёт по пользователям | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-stats.css"],
    },
    {
        "out": "stats-payments.html",
        "content": "lk-stats-payments-content.html",
        "nav": "stats-payments",
        "title": "Статистика по платежам | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-stats.css"],
    },
    {
        "out": "stats-transfers.html",
        "content": "lk-stats-transfers-content.html",
        "nav": "stats-transfers",
        "title": "Статистика по переданным показаниям | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-stats.css"],
    },
    {
        "out": "profile.html",
        "content": "lk-profile-content.html",
        "nav": "profile",
        "title": "Профиль | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-profile.css"],
        "js":  ["assets/lk/js/lk-profile.js"],
    },
    {
        "out": "online-pay.html",
        "content": "lk-online-pay-content.html",
        "nav": "payments",
        "title": "Оплата задолженности | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-pay.css"],
        "js":  ["assets/lk/js/lk-pay.js"],
    },
    {
        "out": "online-pay-success.html",
        "content": "lk-pay-success-content.html",
        "nav": "payments",
        "title": "Оплата прошла успешно | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-pay.css"],
        "js":  ["assets/lk/js/lk-pay.js"],
    },
    {
        "out": "online-pay-fail.html",
        "content": "lk-pay-fail-content.html",
        "nav": "payments",
        "title": "Проблемы с оплатой | ООО «ЭСК Новая энергия»",
        "css": ["assets/lk/css/lk-pay.css"],
        "js":  ["assets/lk/js/lk-pay.js"],
    },
]


def cut(text, start, end, include_end=True):
    i = text.index(start)
    j = text.index(end, i) + (len(end) if include_end else 0)
    return text[i:j]


def localize(html):
    """Пути статики -> локальные, ссылки разделов сайта -> абсолютные."""
    html = html.replace("/static/", "assets/site/")
    # href="/что-то/" -> https://enerone.ru/что-то/   (кроме якорей и уже абсолютных)
    html = re.sub(r'href="/(?!/)', f'href="{SITE}/', html)
    # ссылки на ЛК ведут на наш локальный прототип
    for lk_url in ("/users/login/", "/users/lk/"):
        html = html.replace(f'href="{SITE}{lk_url}"', 'href="index.html"')
    return html


ICON_DIR = ROOT / "assets" / "site" / "img" / "icons"
_icon_cache = {}


def read_icon(name):
    """viewBox и внутренности иконки боевого сайта (assets/site/img/icons/<name>.svg)."""
    if name not in _icon_cache:
        raw = (ICON_DIR / (name + ".svg")).read_text(encoding="utf-8").strip()
        m = re.match(r"<svg\b([^>]*)>(.*)</svg>", raw, re.S)
        attrs, inner = m.group(1), m.group(2).strip()
        vb = re.search(r'viewBox="([^"]+)"', attrs)
        _icon_cache[name] = (vb.group(1) if vb else "0 0 24 24", inner, raw)
    return _icon_cache[name]


def inline_icons(html):
    """<use xlink:href="файл.svg#id"> не работает при открытии страницы по file://
    (внешний документ считается другим origin) — поэтому вклеиваем иконки в разметку,
    а маски градиента переводим в data:URI."""

    def use_repl(m):
        vb, inner, _ = read_icon(m.group(1))
        return '<svg viewBox="%s" aria-hidden="true">%s</svg>' % (vb, inner)

    html = re.sub(
        r'<svg>\s*<use xlink:href="assets/site/img/icons/([a-z0-9_-]+)\.svg#[^"]*"\s*></use>\s*</svg>',
        use_repl, html, flags=re.S)

    def mask_repl(m):
        _, _, raw = read_icon(m.group(1))
        data = quote(re.sub(r"\s+", " ", raw), safe="")
        return "url('data:image/svg+xml,%s')" % data

    html = re.sub(
        r"url\('assets/site/img/icons/([a-z0-9_-]+)\.svg#[^']*'\)",
        mask_repl, html)

    # соцсети в подвале тянулись с github — забираем локальную копию
    html = html.replace("https://luzhetskiy.github.io/enerone-html/img/icons/",
                        "assets/site/img/icons/")
    return html


def lk_offcanvas(sidebar):
    """Меню ЛК в мобильной шапке: те же разделы и те же иконки, что в сайдбаре."""
    nav = (sidebar
           .replace('class="lk-sidebar"', 'class="lk-sidebar lk-sidebar--oc"')
           .replace(' data-lk-sidebar', ''))
    return OFFCANVAS_USER.replace("{{LK_NAV}}", nav)


def build():
    src = SRC.read_text(encoding="utf-8")

    offcanvas_all = localize(
        cut(src,
            '<div class="offcanvas bs-offcanvas bs-offcanvas-start bs-offcanvas--menu"',
            '<div class="site-container">',
            include_end=False).rstrip()
    )
    # боевое меню ЛК (#offcanvas-user) отбрасываем — собираем своё из сайдбара
    i = offcanvas_all.index('id="offcanvas-user"')
    offcanvas_menu = offcanvas_all[:offcanvas_all.rindex('<div class="offcanvas', 0, i)].rstrip()

    header = localize(cut(src, '<header class="bs-header"', "</header>"))
    # копия страницы снята у разлогиненного пользователя: иконка вела на форму входа.
    # В прототипе пользователь авторизован — открываем меню кабинета.
    header = re.sub(
        r'<a type="button" class="bs-btn bs-btn-has-icon bs-btn-icon" href="index.html">(.*?)</a>',
        lambda m: ('<button type="button" class="bs-btn bs-btn-has-icon bs-btn-icon"\n'
                   '                                  data-bs-toggle="offcanvas"\n'
                   '                                  data-bs-target="#offcanvas-user"\n'
                   '                                  aria-controls="offcanvas-user"\n'
                   '                                  aria-label="Разделы кабинета">'
                   + m.group(1) + '</button>'),
        header, count=1, flags=re.S)

    footer = localize(cut(src, '<footer class="bs-footer">', "</footer>"))

    header, footer, offcanvas_menu = (inline_icons(header),
                                      inline_icons(footer),
                                      inline_icons(offcanvas_menu))

    sidebar_tpl = (ROOT / "_source" / "_sidebar.html").read_text(encoding="utf-8").rstrip()

    for page in PAGES:
        content = (ROOT / "_source" / page["content"]).read_text(encoding="utf-8")

        # активный пункт сайдбара
        sidebar = sidebar_tpl.replace(
            'data-nav="%s"' % page["nav"],
            'data-nav="%s" aria-current="page"' % page["nav"],
        ).replace(
            'class="lk-nav-item" data-nav="%s" aria-current="page"' % page["nav"],
            'class="lk-nav-item is-active" data-nav="%s" aria-current="page"' % page["nav"],
        )
        content = content.replace("{{SIDEBAR}}", sidebar)
        offcanvas = offcanvas_menu + "\n\n" + lk_offcanvas(sidebar)

        extra_css = "".join(
            '\n    <link rel="stylesheet" href="%s">' % h for h in page.get("css", []))
        extra_js = "".join(
            '\n<script src="%s"></script>' % h for h in page.get("js", []))

        html = TEMPLATE.format(
            title=page["title"],
            extra_css=extra_css,
            extra_js=extra_js,
            offcanvas=offcanvas,
            header=header,
            footer=footer,
            content=content,
        )
        (ROOT / page["out"]).write_text(html, encoding="utf-8")
        print("собрано: %s (%d симв.)" % (page["out"], len(html)))

OFFCANVAS_USER = """<div class="offcanvas bs-offcanvas bs-offcanvas-start bs-offcanvas--menu" tabindex="-1"
     id="offcanvas-user"
     data-bs-backdrop="false"
     aria-labelledby="offcanvas-user-label">
    <div class="bs-offcanvas-body">
        <div class="lk lk-oc">

            <div class="lk-oc-user">
                <span class="lk-oc-ava">
                    <svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="6" r="3" stroke-width="1.4"/><path d="M3 16a6 6 0 0112 0" stroke-width="1.4"/></svg>
                </span>
                <span class="lk-oc-who">
                    <span class="lk-oc-name">Индивидуальный предприниматель Коваленко Наталья Ивановна</span>
                    <span class="lk-oc-inn">ИНН 745301234567</span>
                </span>
            </div>

{{LK_NAV}}

        </div>
    </div>
</div>"""


TEMPLATE = """<!DOCTYPE html>
<html lang="ru" class="page">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <title>{title}</title>

    <link rel="shortcut icon" href="assets/site/favicon.ico" type="image/x-icon">

    <link rel="preload" href="assets/site/fonts/Roboto-Regular.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="assets/site/fonts/Roboto-Medium.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="assets/site/fonts/Oswald-Medium.woff2" as="font" type="font/woff2" crossorigin>

    <!-- Стили боевого сайта: нужны для шапки и подвала -->
    <link rel="stylesheet" href="assets/site/css/vendor.css">
    <link rel="stylesheet" href="assets/site/css/bootstrap.css">
    <link rel="stylesheet" href="assets/site/css/main.css">
    <link rel="stylesheet" href="assets/site/css/new.css">
    <link rel="stylesheet" href="assets/site/css/custom.css">

    <!-- Наши стили личного кабинета -->
    <link rel="stylesheet" href="assets/lk/css/lk.css">{extra_css}
</head>
<body class="page-body">

{offcanvas}

<div class="site-container">

    {header}

    <main class="main">
        <section class="section">
            <div class="bs-container">

{content}

            </div>
        </section>
    </main>

    {footer}

</div>

<!-- Скрипты боевого сайта: шапка, offcanvas-меню, dropdown -->
<script src="assets/site/js/jquery.min.js"></script>
<script src="assets/site/js/bootstrap.js"></script>
<script src="assets/site/js/popper.min.js"></script>
<script src="assets/site/js/scroll-lock.min.js"></script>
<script src="assets/site/js/main.js"></script>

<!-- Наши скрипты личного кабинета -->
<script src="assets/lk/js/lk.js"></script>{extra_js}

</body>
</html>
"""


if __name__ == "__main__":
    build()
