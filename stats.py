"""
Knygų statistikos skaičiavimo modulis
"""


def calculate_stats(books):
    """
    Apskaičiuoja knygų statistiką

    Args:
        books: Knygų sąrašas (list)

    Returns:
        dict: Statistikos duomenys
    """
    total = len(books)
    read = sum(1 for b in books if b.get('read'))
    lent = sum(1 for b in books if b.get('lentTo'))

    # Language stats
    languages = {'lt': 0, 'sv': 0, 'en': 0, 'ru': 0, 'other': 0}
    for book in books:
        lang = book.get('language', 'other')
        if lang in languages:
            languages[lang] += 1
        else:
            languages['other'] += 1

    # Author country stats
    countries = {}
    for book in books:
        country = book.get('authorCountry', '')
        if country:
            countries[country] = countries.get(country, 0) + 1

    # Owner stats - 3 categories: paper, digital-only, audio
    owners = {
        'kristina': {
            'paper': {'total': 0, 'read': 0},
            'digital': {'total': 0, 'read': 0},
            'audio': {'total': 0, 'listened': 0}
        },
        'darius': {
            'paper': {'total': 0, 'read': 0},
            'digital': {'total': 0, 'read': 0},
            'audio': {'total': 0, 'listened': 0}
        },
        'skolinta': {
            'paper': {'total': 0, 'read': 0},
            'digital': {'total': 0, 'read': 0},
            'audio': {'total': 0, 'listened': 0}
        },
        'nepriskirta': {
            'paper': {'total': 0, 'read': 0},
            'digital': {'total': 0, 'read': 0},
            'audio': {'total': 0, 'listened': 0}
        }
    }

    for book in books:
        owner = book.get('owner', '')
        # If owner is empty or not set, count as 'nepriskirta'
        if not owner:
            owner = 'nepriskirta'

        if owner in owners:
            book_formats = book.get('formats', [])
            is_read = book.get('read', False)
            is_listened = book.get('listened', False)

            # Classify book by format priority
            has_paper = 'paper' in book_formats
            has_digital = any(fmt in book_formats for fmt in ['ebook-md', 'ebook-pdf', 'ebook-epub'])
            has_audio = 'audio' in book_formats

            # Paper (with or without digital) takes priority
            if has_paper:
                owners[owner]['paper']['total'] += 1
                if is_read:
                    owners[owner]['paper']['read'] += 1
            # Digital-only (no paper)
            elif has_digital:
                owners[owner]['digital']['total'] += 1
                if is_read:
                    owners[owner]['digital']['read'] += 1

            # Audio is tracked separately
            if has_audio:
                owners[owner]['audio']['total'] += 1
                if is_listened:
                    owners[owner]['audio']['listened'] += 1

    # Format stats
    formats = {
        'paper': 0,
        'audio': 0,
        'ebook-md': 0,
        'ebook-pdf': 0,
        'ebook-epub': 0
    }
    for book in books:
        book_formats = book.get('formats', [])
        for fmt in book_formats:
            if fmt in formats:
                formats[fmt] += 1

    # Reading stats by format
    format_reading = {
        'paper': {'total': 0, 'read': 0},
        'audio': {'total': 0, 'read': 0},
        'ebook': {'total': 0, 'read': 0}
    }
    for book in books:
        book_formats = book.get('formats', [])
        is_read = book.get('read', False)

        if 'paper' in book_formats:
            format_reading['paper']['total'] += 1
            if is_read:
                format_reading['paper']['read'] += 1

        if 'audio' in book_formats:
            format_reading['audio']['total'] += 1
            if is_read:
                format_reading['audio']['read'] += 1

        if any(fmt in book_formats for fmt in ['ebook-md', 'ebook-pdf', 'ebook-epub']):
            format_reading['ebook']['total'] += 1
            if is_read:
                format_reading['ebook']['read'] += 1

    # Format combinations stats
    format_combinations = {
        'paperOnly': 0,
        'audioOnly': 0,
        'digitalOnly': 0,
        'paperAudio': 0,
        'paperDigital': 0,
        'audioDigital': 0,
        'allThree': 0
    }

    # Paper book stats
    paper_total = sum(1 for b in books if 'paper' in b.get('formats', []))
    paper_read = sum(1 for b in books if 'paper' in b.get('formats', []) and b.get('read'))

    # Audio book stats
    listened_count = sum(1 for b in books if b.get('listened'))
    audio_total = sum(1 for b in books if 'audio' in b.get('formats', []))

    for book in books:
        book_formats = book.get('formats', [])
        has_paper = 'paper' in book_formats
        has_audio = 'audio' in book_formats
        has_digital = any(fmt in book_formats for fmt in ['ebook-md', 'ebook-pdf', 'ebook-epub'])

        if has_paper and has_audio and has_digital:
            format_combinations['allThree'] += 1
        elif has_paper and has_audio:
            format_combinations['paperAudio'] += 1
        elif has_paper and has_digital:
            format_combinations['paperDigital'] += 1
        elif has_audio and has_digital:
            format_combinations['audioDigital'] += 1
        elif has_paper:
            format_combinations['paperOnly'] += 1
        elif has_audio:
            format_combinations['audioOnly'] += 1
        elif has_digital:
            format_combinations['digitalOnly'] += 1

    return {
        'total': total,
        'read': read,
        'unread': total - read,
        'paperTotal': paper_total,
        'paperRead': paper_read,
        'listened': listened_count,
        'audioTotal': audio_total,
        'lent': lent,
        'languages': languages,
        'countries': countries,
        'owners': owners,
        'formats': formats,
        'formatReading': format_reading,
        'formatCombinations': format_combinations
    }
